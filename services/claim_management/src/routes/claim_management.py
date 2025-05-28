from typing import Union, List
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import httpx
import time
from datetime import datetime # Ensure datetime is imported
from src.database.db import SessionLocal
from src.schemas.claim_management_schema import (
    ClaimReadSchema,
    ErrorResponse,
    ClaimTriggerSchema
)
from typing import List
import httpx
from pydantic import BaseModel, ConfigDict # Added for new schemas

from src.database.crud.claim_management_crud import (
    create_claim,
    get_all_claims,
    update_claim_status,
    update_claim_amount,
    get_claim,
    authorize_claim
)
from src.database.models.claim_management import ClaimStatusEnum, ClaimTypeEnum, Claim  # Added Claim model import
from src.core.config import settings
import logging

logger = logging.getLogger(__name__)

POLICY_SERVICE_BASE_URL = settings.POLICY_SERVICE_URL
CONFIG_BASE = settings.CONFIG_SERVICE_URL  # base URL for config service

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
router = APIRouter()

# Static thresholds
CROP_TRIGGER = 15
CROP_EXIT = 5
LIVESTOCK_TRIGGER = 1.5
LIVESTOCK_EXIT = 0.5
LIVESTOCK_MP_PERCENT = 0.1  # Define minimum payment percentage


timeout = httpx.Timeout(
    connect=5.0,   # max time to connect
    read=30.0,     # max time to read a response
    write=5.0,     # max time to write the request
    pool=None      # use default pool timeout
)

async def fetch_policy_details():
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.get(
                f"{POLICY_SERVICE_BASE_URL}/api/policies/details",
            )
            response.raise_for_status() 
            return response.json()
        except httpx.HTTPError as e:
            logger.exception("Error fetching policy details from policy service." + str(e))
            raise HTTPException(status_code=503, detail="Policy service is unavailable.")

def calculate_livestock_claim(z_score: float, sum_insured: float):
    if z_score >= LIVESTOCK_TRIGGER:
        return 0.0
    if z_score <= LIVESTOCK_EXIT:
        return sum_insured
    
    ratio = (LIVESTOCK_TRIGGER - z_score) / (LIVESTOCK_TRIGGER - LIVESTOCK_EXIT)
    claim_amount = ratio * sum_insured
    min_payment = LIVESTOCK_MP_PERCENT * sum_insured
    return max(claim_amount, min_payment)

async def process_all_claims_task(db_session_factory, background_tasks_parent: BackgroundTasks):
    """
    Processes claims for all policies and customers in the background.
    Manages its own database session.
    """
    db: Session = db_session_factory()
    try:
        logger.info("Starting background task: process_all_claims_task")
        policies = await fetch_policy_details()
        if not policies:
            logger.info("No policies found to process in background task.")
            return

        logger.info(f"Found {len(policies)} policies to process.")

        for policy_index, policy in enumerate(policies):
            claim_id_for_logging = "N/A"
            try:
                logger.debug(f"Processing policy {policy_index + 1}/{len(policies)}: {policy.get('policy_id')}")
                
                required_keys = ['policy_id', 'customer_id', 'cps_zone', 'period', 'product_type', 'period_sum_insured']
                if not all(policy.get(k) is not None for k in required_keys):
                    logger.error(f"Skipping policy due to missing essential details: Policy Data {policy}")
                    continue

                current_policy_id = policy['policy_id']
                current_period = policy['period']
                ctype = ClaimTypeEnum.CROP.value if policy.get('product_type') == 1 else ClaimTypeEnum.LIVESTOCK.value

                # Check if a claim for this policy_id and period already exists
                existing_claim = db.query(Claim).filter(
                    Claim.policy_id == current_policy_id,
                    Claim.period == current_period 
                ).first()

                if existing_claim:
                    logger.info(f"Claim already exists for policy_id {current_policy_id} and period {current_period} (Claim ID: {existing_claim.id}). Skipping creation.")
                    continue
                
                claim_data = {
                    "policy_id": current_policy_id,
                    "customer_id": policy['customer_id'],
                    "grid_id": policy.get('grid') or policy['cps_zone'], 
                    "claim_type": ctype,
                    "status": ClaimStatusEnum.PROCESSING.value,
                    "period": current_period  # Added period to claim_data
                }
                
                created_claim = create_claim(db, claim_data)
                # Assuming create_claim commits and refreshes, so created_claim.id is an int.
                # If type errors persist here, it's a static analysis issue with model/CRUD typing.
                
                if not created_claim or not isinstance(created_claim.id, int):
                    logger.error(f"Failed to create claim or retrieve valid claim ID for policy: {policy.get('policy_id')}")
                    continue
                
                claim_id_for_logging = created_claim.id # For logging in subsequent error blocks

                cps = policy['cps_zone']
                period = policy['period']

                async with httpx.AsyncClient(timeout=timeout) as client:
                    cfg_resp = await client.get(f"{CONFIG_BASE}{settings.API_V1_STR}/cps_zone/{int(cps)}/{int(period)}")
 
                if cfg_resp.status_code != 200:
                    logger.error(f"Error fetching config for Claim ID {claim_id_for_logging}, Policy {policy.get('policy_id')}, CPS zone {cps}, Period {period}. Status: {cfg_resp.status_code}, Response: {cfg_resp.text}")
                    update_claim_amount(db, created_claim.id, 0.0)
                    update_claim_status(db, created_claim.id, ClaimStatusEnum.SETTLED.value) # Mark as settled with 0 if config fails
                    if cfg_resp.status_code == 404:
                        logger.warning(f"Config data missing for CPS zone {cps}, period {period}. Claim ID {claim_id_for_logging} marked as SETTLED. Link: {cfg_resp.url}")
                    else:
                        logger.warning(f"Config service issue for CPS zone {cps}, period {period}. Claim ID {claim_id_for_logging} marked as SETTLED.")
                    continue 

                cfgj = cfg_resp.json()
                trig, exitp = cfgj.get('trigger_point', 0), cfgj.get('exit_point', 0)

                if trig == 0 or exitp == 0:
                    logger.info(f"No growing season (trigger/exit is 0) for Claim ID {claim_id_for_logging}, Policy {policy.get('policy_id')}. Marking as SETTLED with 0 amount.")
                    update_claim_amount(db, created_claim.id, 0.0)
                    update_claim_status(db, created_claim.id, ClaimStatusEnum.SETTLED.value)
                else:
                    logger.debug(f"Adding process_claim task for Claim ID {claim_id_for_logging}, Type {ctype}")
                    # process_claim will create its own DB session
                    background_tasks_parent.add_task(process_claim, created_claim.id, ctype, policy)
            
            except httpx.HTTPError as http_err:
                logger.error(f"HTTP error processing policy {policy.get('policy_id', 'N/A')} (Claim ID if created: {claim_id_for_logging}): {http_err}")
                if claim_id_for_logging != "N/A" and isinstance(claim_id_for_logging, int): # Check if claim was created
                    update_claim_amount(db, claim_id_for_logging, 0.0)
                    update_claim_status(db, claim_id_for_logging, ClaimStatusEnum.SETTLED.value)
            except Exception as e:
                logger.error(f"Unexpected error processing policy {policy.get('policy_id', 'N/A')} (Claim ID if created: {claim_id_for_logging}): {str(e)}", exc_info=True)
                if claim_id_for_logging != "N/A" and isinstance(claim_id_for_logging, int): # Check if claim was created
                    update_claim_amount(db, claim_id_for_logging, 0.0)
                    update_claim_status(db, claim_id_for_logging, ClaimStatusEnum.SETTLED.value)
        
        logger.info("Finished background task: process_all_claims_task")
    
    except httpx.HTTPError as http_err:
        logger.error(f"Failed to fetch policy details at the start of process_all_claims_task: {http_err}")
    except Exception as e:
        logger.error(f"General error in process_all_claims_task: {str(e)}", exc_info=True)
    finally:
        if db:
            db.close()
            logger.debug("Database session closed for process_all_claims_task.")

# Define the new output schema for individual claims within the customer aggregation
class ClaimDetailForCustomerOutputSchema(BaseModel):
    # Explicitly list fields for the output, EXCLUDING cps_zone
    id: int
    policy_id: int
    grid_id: str | None = None
    claim_type: str
    status: str
    claim_amount: float | None = None
    created_at: datetime | None = None # Assuming these might be on the DB object
    updated_at: datetime | None = None # Assuming these might be on the DB object
    period: int | None = None

    model_config = ConfigDict(from_attributes=True)

# Update CustomerClaimsSummarySchema to use the new claim detail schema
class CustomerClaimsSummarySchema(BaseModel):
    customer_id: int
    claims: List[ClaimDetailForCustomerOutputSchema]

# Remove or comment out the old ClaimDetailWithPeriodSchema if it's no longer needed elsewhere
# class ClaimDetailWithPeriodSchema(ClaimReadSchema):
#     period: int | None = None

async def process_claim(claim_id: int, claim_type: str, policy_data: dict):
    db = SessionLocal()
    try:
        # grid_id for NDVI can be 'grid' or fallback to 'cps_zone' from policy_data
        grid_id_for_ndvi = policy_data.get('grid') or policy_data['cps_zone']
        period_for_ndvi = policy_data['period']
        sum_insured = float(policy_data['period_sum_insured'])

        # Fetch NDVI using the new specific endpoint: /ndvi/{grid_id}/{period}
        ndvi_val = 0.0  # Default NDVI value
        async with httpx.AsyncClient(timeout=timeout) as client:
            ndvi_url = f"{CONFIG_BASE}{settings.API_V1_STR}/ndvi/{int(grid_id_for_ndvi)}/{int(period_for_ndvi)}"
            logger.info(f"Fetching NDVI for claim_id {claim_id}: URL: {ndvi_url}")
            try:
                ndvi_resp = await client.get(ndvi_url)
                ndvi_resp.raise_for_status()  # Raise an exception for HTTP 4xx or 5xx errors
                ndvi_json = ndvi_resp.json()
                
                # Corrected to use 'ndvi_value'
                if isinstance(ndvi_json.get('ndvi_value'), (int, float)):
                    ndvi_val = float(ndvi_json['ndvi_value'])
                    logger.info(f"Successfully fetched NDVI value {ndvi_val} for claim_id {claim_id}, grid {grid_id_for_ndvi}, period {period_for_ndvi}.")
                else:
                    # Corrected log message and key access
                    logger.error(f"NDVI key 'ndvi_value' missing or not a number in response from {ndvi_url} for claim_id {claim_id}. Response: {ndvi_json}. Defaulting NDVI to 0.0.")
                    # Consider if claim status should be updated to 'failed' here or if claim should be settled with 0
                    update_claim_amount(db, claim_id, 0.0)
                    update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                    logger.warning(f"Claim ID {claim_id} marked as SETTLED due to missing/invalid NDVI value.")
                    return # Exit processing for this claim if NDVI is critical and missing
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error fetching NDVI from {ndvi_url} for claim_id {claim_id}: {e}. Defaulting NDVI to 0.0 and marking claim as SETTLED.")
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return # Exit processing for this claim
            except Exception as e:
                logger.error(f"Error fetching or parsing NDVI from {ndvi_url} for claim_id {claim_id}: {e}. Defaulting NDVI to 0.0 and marking claim as SETTLED.")
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return # Exit processing for this claim
        
        # calculate amount based on config thresholds
        if claim_type == ClaimTypeEnum.CROP.value:
            # New: Check if period is within growing season
            async with httpx.AsyncClient(timeout=timeout) as client:
                season_url = f"{CONFIG_BASE}{settings.API_V1_STR}/growing_season/{int(grid_id_for_ndvi)}"
                logger.info(f"Checking growing season for claim_id {claim_id}: URL: {season_url}")
                season_resp = await client.get(season_url)
            if season_resp.status_code != 200:
                logger.error(f"Failed to fetch growing season from {season_url} for claim_id {claim_id}. Marking as SETTLED.")
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return
            season_periods = season_resp.json()
            if period_for_ndvi not in season_periods:
                logger.info(f"Period {period_for_ndvi} not in growing season {season_periods} for claim_id {claim_id}. Skipping calculation and settling claim.")
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return
            # existing CROP calculation continues...
            # cps_zone is used for fetching crop configuration (trigger/exit points)
            cps_zone_for_config = policy_data['cps_zone'] 
            period_for_config = policy_data['period'] # period is already available

            async with httpx.AsyncClient(timeout=timeout) as client:
                cfg_url = f"{CONFIG_BASE}{settings.API_V1_STR}/cps_zone/{int(cps_zone_for_config)}/{int(period_for_config)}"
                logger.info(f"Fetching CROP config for claim_id {claim_id}: URL: {cfg_url}")
                cfg_resp = await client.get(cfg_url)
                # Handle config fetch failure specifically for CROP claims
                if cfg_resp.status_code != 200:
                    logger.error(f"Failed to fetch CROP config from {cfg_url} for claim_id {claim_id}. Status: {cfg_resp.status_code}. Marking claim as SETTLED with 0 amount.")
                    update_claim_amount(db, claim_id, 0.0)
                    update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                    return # Exit processing for this claim
                
                cfg = cfg_resp.json()
            trig, exitp = cfg.get('trigger_point', 0), cfg.get('exit_point', 0)
            # no growing season yields zero claim
            if trig == 0 and exitp == 0:
                amount = 0.0
            elif ndvi_val >= trig:
                amount = 0.0
            elif ndvi_val <= exitp:
                amount = sum_insured
            else:
                ratio = (trig - ndvi_val) / (trig - exitp)
                amount = round(ratio * sum_insured, 2)
        else:
            # livestock claim calculation
            z_score = (ndvi_val - 0.5) * 2
            amount = calculate_livestock_claim(z_score, sum_insured)
        update_claim_amount(db, claim_id, amount)
        time.sleep(0.2)
        update_claim_status(db, claim_id, ClaimStatusEnum.PENDING.value)
    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}")
    finally:
        db.close()

@router.post("/claims/crop", response_model=dict)
async def create_crop_claim(
    period: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policy_details = await fetch_policy_details()
    crops = [p for p in policy_details if p['product_type'] == 1 and p['period'] == period]
    if not crops:
        raise HTTPException(400, "No valid crop policies found for the specified period")
    for policy in crops:
        # Ensure claim is committed and ID is available before adding to background task
        db.begin_nested() # Use a nested transaction for individual claim creation
        try:
            claim_instance = create_claim(db, {
                "policy_id": policy['policy_id'],
                "customer_id": policy['customer_id'],
                "grid_id": policy.get('grid') or policy['cps_zone'], # Use 'grid' if available, else 'cps_zone'
                "claim_type": ClaimTypeEnum.CROP.value,
                "status": ClaimStatusEnum.PROCESSING.value,
                "period": policy['period'] # Ensure period is included
            })
            db.commit() # Commit the nested transaction to get the ID
            # The claim_instance should now have an integer ID if create_claim refreshes it.
            # If create_claim doesn't refresh, you might need to query it or ensure it does.
            # For now, assuming claim_instance.id is an int after commit.
            if claim_instance and isinstance(claim_instance.id, int):
                background_tasks.add_task(
                    process_claim,
                    claim_instance.id, # Pass the integer ID
                    ClaimTypeEnum.CROP.value,
                    policy
                )
            else:
                logger.error(f"Failed to create claim or get valid ID for policy {policy.get('policy_id')}")
                # Optionally, rollback the main transaction or handle error
        except Exception as e:
            db.rollback() # Rollback nested transaction on error
            logger.error(f"Error creating claim for policy {policy.get('policy_id')}: {e}")
            # Decide if to continue with other policies or raise an error

    return {"message": "Crop claims processing initiated for the specified period."}

@router.post("/claims/livestock", response_model=dict)
async def create_livestock_claim(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policies = await fetch_policy_details()
    livestocks = [p for p in policies if p['product_type'] == 2]
    if not livestocks:
        raise HTTPException(400, "No valid livestock policies found")
    for policy in livestocks:
        db.begin_nested()
        try:
            claim_instance = create_claim(db, {
                "policy_id": policy['policy_id'],
                "customer_id": policy['customer_id'],
                "grid_id": policy.get('grid') or policy['cps_zone'], # Use 'grid' if available, else 'cps_zone'
                "claim_type": ClaimTypeEnum.LIVESTOCK.value,
                "status": ClaimStatusEnum.PROCESSING.value,
                "period": policy['period'] # Ensure period is included
            })
            db.commit()
            if claim_instance and isinstance(claim_instance.id, int):
                background_tasks.add_task(
                    process_claim,
                    claim_instance.id, # Pass the integer ID
                    ClaimTypeEnum.LIVESTOCK.value,
                    policy
                )
            else:
                logger.error(f"Failed to create claim or get valid ID for policy {policy.get('policy_id')}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating claim for policy {policy.get('policy_id')}: {e}")

    return {"message": "Livestock claims processing initiated."}

@router.post("/claims/trigger", response_model=dict)
async def trigger_claims(
    background_tasks: BackgroundTasks,
    # Removed db: Session = Depends(get_db) as the background task manages its own session
):
    """
    Triggers claim processing for all policies.
    This operation runs in the background.
    """
    logger.info("Received request to /claims/trigger. Initiating background processing for all claims.")
    # Pass the SessionLocal factory and the current background_tasks instance
    background_tasks.add_task(process_all_claims_task, SessionLocal, background_tasks)
    return {"message": "Claim processing for all policies has been initiated in the background."}

@router.get("/claims/by-customer", response_model=List[CustomerClaimsSummarySchema], tags=["claims"]) # Corrected tags syntax
async def get_claims_grouped_by_customer(db: Session = Depends(get_db)):
    all_claims_db = get_all_claims(db)
    if not all_claims_db:
        raise HTTPException(status_code=404, detail="No claims found in the system.")

    try:
        policy_details_list = await fetch_policy_details()
    except HTTPException as e:
        # Re-raise if fetch_policy_details already prepared an HTTPException (e.g., service unavailable)
        raise e
    except Exception as e:
        logger.error(f"Failed to fetch policy details for claims aggregation: {str(e)}")
        # Return a 503 if policy service is down or another error occurred
        raise HTTPException(status_code=503, detail="Could not retrieve policy details necessary for claim aggregation.")

    policy_info_map = {policy['policy_id']: policy for policy in policy_details_list}

    customer_aggregated_claims = {}

    for claim_db_obj in all_claims_db:
            # Ensure customer_id is present, otherwise skip (or handle as per requirements)
            if claim_db_obj.customer_id is None:
                logger.warning(f"Claim ID {claim_db_obj.id} has no customer_id, skipping for aggregation.")
                continue
            
            customer_id = claim_db_obj.customer_id
            policy_id = claim_db_obj.policy_id
            
            period = None
            policy_data = policy_info_map.get(policy_id)
            if policy_data:
                period = policy_data.get('period')
            else:
                logger.warning(f"Policy details not found for policy_id {policy_id} related to claim_id {claim_db_obj.id}.")

            # Prepare data for ClaimDetailForCustomerOutputSchema
            data_for_output_schema = {
                "id": claim_db_obj.id,
                "policy_id": claim_db_obj.policy_id,
                "grid_id": str(getattr(claim_db_obj, 'grid_id', None)),
                "claim_type": getattr(claim_db_obj, 'claim_type', None),
                "status": getattr(claim_db_obj, 'status', None),
                "claim_amount": getattr(claim_db_obj, 'claim_amount', None),
                "created_at": getattr(claim_db_obj, 'created_at', None),
                "updated_at": getattr(claim_db_obj, 'updated_at', None),
                "period": period
            }
            
            try:
                # Create an instance of the specific output schema
                # This validates that all required fields in ClaimDetailForCustomerOutputSchema are present
                # and have the correct types. cps_zone is not in this schema.
                claim_output_item = ClaimDetailForCustomerOutputSchema(**data_for_output_schema)
            except Exception as e: # Ideally, catch pydantic.ValidationError
                logger.error(f"Error creating ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id}: {e}. Data: {data_for_output_schema}")
                continue # Skip this claim

            if customer_id not in customer_aggregated_claims:
                customer_aggregated_claims[customer_id] = []
            customer_aggregated_claims[customer_id].append(claim_output_item) # Append the validated schema instance

    if not customer_aggregated_claims:
        # If no *active* claims are found matching the criteria, return an empty list.
        # This is different from no claims in the system at all.
        return []

    result = [
        CustomerClaimsSummarySchema(customer_id=cust_id, claims=claims_list)
        for cust_id, claims_list in customer_aggregated_claims.items()
    ]
    return result

@router.get("/", responses={404: {"model": ErrorResponse}})
def get_all_claims_endpoint(db: Session = Depends(get_db)):
    claims = get_all_claims(db)
    if not claims:
        raise HTTPException(status_code=404, detail="No claims found")
    return claims

@router.get("/{claim_id}", responses={404: {"model": ErrorResponse}})
def get_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    claim = get_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.put("/{claim_id}/authorize", responses={404: {"model": ErrorResponse}})
def authorize_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    claim = authorize_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim