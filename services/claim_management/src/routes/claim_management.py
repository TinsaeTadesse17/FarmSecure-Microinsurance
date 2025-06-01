from fastapi import HTTPException, APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import time
from datetime import datetime
import logging

from pydantic import BaseModel, ConfigDict
from typing import List

from src.database.db import SessionLocal
from src.schemas.claim_management_schema import ClaimReadSchema, ErrorResponse
from src.services.policy_service import fetch_policy_details
from src.services.config_service import fetch_cps_config, fetch_ndvi, fetch_growing_season
from src.services.claim_calculator import calculate_crop_claim, calculate_livestock_claim
from src.database.crud.claim_management_crud import create_claim, get_all_claims, update_claim_status, update_claim_amount, get_claim, authorize_claim
from src.database.models.claim_management import ClaimStatusEnum, ClaimTypeEnum, Claim
logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
router = APIRouter()

async def process_all_claims_task(db_session_factory, background_tasks_parent: BackgroundTasks):
    """
    Processes claims for all policies and customers in the background.
    Manages its own database session.
    """
    logger.info("Starting process_all_claims_task")
    db: Session = db_session_factory()
    try:
        logger.info("Starting background task: process_all_claims_task")
        try:
            logger.debug("Fetching policy details in process_all_claims_task")
            policies = await fetch_policy_details()
            logger.debug(f"Fetched {len(policies) if policies else 0} policy details")
        except HTTPException as e:
            logger.error(f"Could not fetch policy details: {e.detail}")
            return
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
                logger.debug(f"Checking for existing claim for policy_id {current_policy_id} and period {current_period}")
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
                logger.debug(f"Creating claim with data: {claim_data}")
                created_claim = create_claim(db, claim_data)
                # Assuming create_claim commits and refreshes, so created_claim.id is an int.
                # If type errors persist here, it's a static analysis issue with model/CRUD typing.
                
                if not created_claim or not isinstance(created_claim.id, int):
                    logger.error(f"Failed to create claim or retrieve valid claim ID for policy: {policy.get('policy_id')}")
                    continue
                
                claim_id_for_logging = created_claim.id # For logging in subsequent error blocks
                logger.info(f"Successfully created claim with ID: {claim_id_for_logging} for policy_id: {current_policy_id}")

                cps = policy['cps_zone']; period = policy['period']
                try:
                    logger.debug(f"Fetching CPS config for CPS {cps}, period {period} for claim {claim_id_for_logging}")
                    cfgj = await fetch_cps_config(int(cps), int(period))
                    logger.debug(f"Fetched CPS config: {cfgj} for claim {claim_id_for_logging}")
                except HTTPException as e:
                    logger.warning(f"Config service error for CPS {cps}, period {period}: {e.detail}. Claim {claim_id_for_logging} will be settled with 0 amount.")
                    update_claim_amount(db, created_claim.id, 0.0)
                    update_claim_status(db, created_claim.id, ClaimStatusEnum.SETTLED.value)
                    logger.info(f"Claim {claim_id_for_logging} settled due to config service error.")
                    continue
                trig, exitp = cfgj.get('trigger_point', 0), cfgj.get('exit_point', 0)

                if trig == 0 or exitp == 0:
                    logger.info(f"Trigger or exit point is 0 for claim {claim_id_for_logging} (trig: {trig}, exitp: {exitp}). Settling claim with 0 amount.")
                    update_claim_amount(db, created_claim.id, 0.0)
                    update_claim_status(db, created_claim.id, ClaimStatusEnum.SETTLED.value)
                    logger.info(f"Claim {claim_id_for_logging} settled.")
                else:
                    logger.debug(f"Adding process_claim task to background for claim ID: {created_claim.id}")
                    background_tasks_parent.add_task(process_claim, created_claim.id, ctype, policy)
            
            except HTTPException as e:
                logger.error(f"Service error for policy {policy.get('policy_id', 'N/A')} (Claim ID: {claim_id_for_logging}): {e.detail}")
                if isinstance(claim_id_for_logging, int):
                    logger.debug(f"Attempting to settle claim {claim_id_for_logging} due to service error.")
                    update_claim_amount(db, claim_id_for_logging, 0.0)
                    update_claim_status(db, claim_id_for_logging, ClaimStatusEnum.SETTLED.value)
                    logger.info(f"Claim {claim_id_for_logging} settled due to service error.")
            except Exception as e:
                logger.error(f"Unexpected error processing policy {policy.get('policy_id', 'N/A')} (Claim ID: {claim_id_for_logging}): {e}", exc_info=True)
                if isinstance(claim_id_for_logging, int):
                    logger.debug(f"Attempting to settle claim {claim_id_for_logging} due to unexpected error.")
                    update_claim_amount(db, claim_id_for_logging, 0.0)
                    update_claim_status(db, claim_id_for_logging, ClaimStatusEnum.SETTLED.value)
                    logger.info(f"Claim {claim_id_for_logging} settled due to unexpected error.")
        
        logger.info("Finished background task: process_all_claims_task")
    
    except Exception as e:
        logger.error(f"General error in process_all_claims_task: {e}", exc_info=True)
    finally:
        if db:
            db.close()
            logger.debug("Database session closed for process_all_claims_task.")
    logger.info("Exiting process_all_claims_task")

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
    logger.info(f"Starting process_claim for claim_id: {claim_id}, type: {claim_type}")
    db = SessionLocal()
    try:
        # grid_id for NDVI can be 'grid' or fallback to 'cps_zone' from policy_data
        grid_id_for_ndvi = policy_data.get('grid') or policy_data['cps_zone']
        period_for_ndvi = policy_data['period']
        sum_insured = float(policy_data['period_sum_insured'])
        logger.debug(f"Processing claim {claim_id}: grid_id_for_ndvi={grid_id_for_ndvi}, period_for_ndvi={period_for_ndvi}, sum_insured={sum_insured}")

        # Fetch NDVI using the new specific endpoint: /ndvi/{grid_id}/{period}
        try:
            logger.debug(f"Fetching NDVI for grid {grid_id_for_ndvi}, period {period_for_ndvi} for claim {claim_id}")
            ndvi_val = await fetch_ndvi(int(grid_id_for_ndvi), int(period_for_ndvi))
            logger.debug(f"Fetched NDVI value: {ndvi_val} for claim {claim_id}")
        except HTTPException as e:
            logger.warning(f"NDVI service error for grid {grid_id_for_ndvi}, period {period_for_ndvi}: {e.detail}. Claim {claim_id} will be settled with 0 amount.")
            update_claim_amount(db, claim_id, 0.0)
            update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
            logger.info(f"Claim {claim_id} settled due to NDVI service error.")
            return
        
        # Determine and calculate claim amount
        if claim_type == ClaimTypeEnum.CROP.value:
            logger.debug(f"Claim {claim_id} is CROP type. Checking growing season.")
            # Check growing season before calculation
            try:
                logger.debug(f"Fetching growing season for grid {grid_id_for_ndvi} for claim {claim_id}")
                seasons = await fetch_growing_season(int(grid_id_for_ndvi))
                logger.debug(f"Fetched growing seasons: {seasons} for claim {claim_id}")
            except HTTPException as e:
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                logger.warning(f"Growing season service error for grid {grid_id_for_ndvi}: {e.detail}. Claim {claim_id} settled.")
                return
            if period_for_ndvi not in seasons:
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                logger.info(f"Period {period_for_ndvi} not in growing season {seasons} for claim {claim_id}. Claim settled.")
                return
            try:
                logger.debug(f"Fetching CPS config for grid {grid_id_for_ndvi}, period {period_for_ndvi} for claim {claim_id}")
                cfg = await fetch_cps_config(int(grid_id_for_ndvi), int(period_for_ndvi))
                logger.debug(f"Fetched CPS config: {cfg} for claim {claim_id}")
            except HTTPException as e:
                logger.warning(f"CPS config fetch error for grid {grid_id_for_ndvi}, period {period_for_ndvi}: {e.detail}. Claim {claim_id} will be settled with 0 amount.")
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                logger.info(f"Claim {claim_id} settled due to CPS config fetch error.")
                return
            trig, exitp = cfg.get('trigger_point', 0), cfg.get('exit_point', 0)
            logger.debug(f"Calculating crop claim for claim {claim_id} with ndvi_val={ndvi_val}, trig={trig}, exitp={exitp}, sum_insured={sum_insured}")
            amount = calculate_crop_claim(ndvi_val, trig, exitp, sum_insured)
            logger.info(f"Calculated crop claim amount for claim {claim_id}: {amount}")
        else:
            logger.debug(f"Claim {claim_id} is LIVESTOCK type.")
            z_score = (ndvi_val - 0.5) * 2
            logger.debug(f"Calculating livestock claim for claim {claim_id} with z_score={z_score}, sum_insured={sum_insured}")
            amount = calculate_livestock_claim(z_score, sum_insured)
            logger.info(f"Calculated livestock claim amount for claim {claim_id}: {amount}")
        
        logger.debug(f"Updating claim amount for claim {claim_id} to {amount}")
        update_claim_amount(db, claim_id, amount)
        time.sleep(0.2) # Consider if this sleep is essential or can be logged around
        logger.debug(f"Updating claim status for claim {claim_id} to PENDING")
        update_claim_status(db, claim_id, ClaimStatusEnum.PENDING.value)
        logger.info(f"Claim {claim_id} processed. Amount: {amount}, Status: PENDING.")
    except Exception as e:
        logger.error(f"Unexpected error in process_claim {claim_id}: {e}", exc_info=True)
        # Attempt to settle the claim if an error occurs during processing
        try:
            logger.debug(f"Attempting to settle claim {claim_id} due to unexpected error during processing.")
            update_claim_amount(db, claim_id, 0.0)
            update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
            logger.info(f"Claim {claim_id} settled due to unexpected error.")
        except Exception as db_error:
            logger.error(f"Failed to update claim {claim_id} to SETTLED after an error: {db_error}", exc_info=True)
    finally:
        db.close()
        logger.debug(f"Database session closed for process_claim {claim_id}.")
    logger.info(f"Exiting process_claim for claim_id: {claim_id}")

@router.post("/claims/crop", response_model=dict)
async def create_crop_claim(
    period: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    logger.info(f"Received request to create crop claims for period: {period}")
    try:
        logger.debug("Fetching policy details for crop claims.")
        policy_details = await fetch_policy_details()
        logger.debug(f"Fetched {len(policy_details)} policy details.")
    except HTTPException as e:
        logger.error(f"Failed to fetch policy details in create_crop_claim: {e.detail}")
        raise # Re-raise the exception to be handled by FastAPI
        
    crops = [p for p in policy_details if p['product_type'] == 1 and p['period'] == period]
    if not crops:
        logger.warning(f"No valid crop policies found for period {period}.")
        raise HTTPException(400, "No valid crop policies found for the specified period")
    
    logger.info(f"Found {len(crops)} crop policies for period {period} to process.")
    processed_claims_count = 0
    for policy_index, policy in enumerate(crops):
        logger.debug(f"Processing crop policy {policy_index + 1}/{len(crops)}: {policy.get('policy_id')}")
        db.begin_nested() # Use a nested transaction for individual claim creation
        try:
            claim_data = {
                "policy_id": policy['policy_id'],
                "customer_id": policy['customer_id'],
                "grid_id": policy.get('grid') or policy['cps_zone'], # Use 'grid' if available, else 'cps_zone'
                "claim_type": ClaimTypeEnum.CROP.value,
                "status": ClaimStatusEnum.PROCESSING.value,
                "period": policy['period'] # Ensure period is included
            }
            logger.debug(f"Creating crop claim with data: {claim_data}")
            claim_instance = create_claim(db, claim_data)
            db.commit() # Commit the nested transaction to get the ID
            logger.info(f"Successfully created crop claim with ID: {claim_instance.id if claim_instance else 'N/A'} for policy_id: {policy.get('policy_id')}")
            
            if claim_instance and isinstance(claim_instance.id, int):
                logger.debug(f"Adding process_claim task to background for crop claim ID: {claim_instance.id}")
                background_tasks.add_task(
                    process_claim,
                    claim_instance.id, # Pass the integer ID
                    ClaimTypeEnum.CROP.value,
                    policy
                )
                processed_claims_count +=1
            else:
                logger.error(f"Failed to create claim or get valid ID for policy {policy.get('policy_id')}")
                # Optionally, rollback the main transaction or handle error
        except Exception as e:
            db.rollback() # Rollback nested transaction on error
            logger.error(f"Error creating claim for policy {policy.get('policy_id')}: {e}", exc_info=True)
            # Decide if to continue with other policies or raise an error

    logger.info(f"Crop claims processing initiated for {processed_claims_count} policies for period {period}.")
    return {"message": "Crop claims processing initiated for the specified period."}

@router.post("/claims/livestock", response_model=dict)
async def create_livestock_claim(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    logger.info("Received request to create livestock claims.")
    try:
        logger.debug("Fetching policy details for livestock claims.")
        policies = await fetch_policy_details()
        logger.debug(f"Fetched {len(policies)} policy details.")
    except HTTPException as e:
        logger.error(f"Failed to fetch policy details in create_livestock_claim: {e.detail}")
        raise

    livestocks = [p for p in policies if p['product_type'] == 2]
    if not livestocks:
        logger.warning("No valid livestock policies found.")
        raise HTTPException(400, "No valid livestock policies found")

    logger.info(f"Found {len(livestocks)} livestock policies to process.")
    processed_claims_count = 0
    for policy_index, policy in enumerate(livestocks):
        logger.debug(f"Processing livestock policy {policy_index + 1}/{len(livestocks)}: {policy.get('policy_id')}")
        db.begin_nested()
        try:
            claim_data = {
                "policy_id": policy['policy_id'],
                "customer_id": policy['customer_id'],
                "grid_id": policy.get('grid') or policy['cps_zone'], # Use 'grid' if available, else 'cps_zone'
                "claim_type": ClaimTypeEnum.LIVESTOCK.value,
                "status": ClaimStatusEnum.PROCESSING.value,
                "period": policy['period'] # Ensure period is included
            }
            logger.debug(f"Creating livestock claim with data: {claim_data}")
            claim_instance = create_claim(db, claim_data)
            db.commit()
            logger.info(f"Successfully created livestock claim with ID: {claim_instance.id if claim_instance else 'N/A'} for policy_id: {policy.get('policy_id')}")

            if claim_instance and isinstance(claim_instance.id, int):
                logger.debug(f"Adding process_claim task to background for livestock claim ID: {claim_instance.id}")
                background_tasks.add_task(
                    process_claim,
                    claim_instance.id, # Pass the integer ID
                    ClaimTypeEnum.LIVESTOCK.value,
                    policy
                )
                processed_claims_count += 1
            else:
                logger.error(f"Failed to create claim or get valid ID for policy {policy.get('policy_id')}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating claim for policy {policy.get('policy_id')}: {e}", exc_info=True)

    logger.info(f"Livestock claims processing initiated for {processed_claims_count} policies.")
    return {"message": "Livestock claims processing initiated."}

@router.post("/claims/trigger", response_model=dict)
async def trigger_claims(
    background_tasks: BackgroundTasks
):
    """
    Triggers claim processing for all policies.
    This operation runs in the background.
    """
    logger.info("Received request to /claims/trigger. Initiating background processing for all claims.")
    # Pass the SessionLocal factory and the current background_tasks instance
    background_tasks.add_task(process_all_claims_task, SessionLocal, background_tasks)
    logger.info("process_all_claims_task added to background tasks.")
    return {"message": "Claim processing for all policies has been initiated in the background."}

@router.get("/claims/by-customer", response_model=List[CustomerClaimsSummarySchema], tags=["claims"] )
async def get_claims_grouped_by_customer(db: Session = Depends(get_db)):
    logger.info("Received request to get claims grouped by customer.")
    logger.debug("Fetching all claims from DB.")
    all_claims_db = get_all_claims(db)
    if not all_claims_db:
        logger.info("No claims found in the system.")
        raise HTTPException(status_code=404, detail="No claims found in the system.")
    logger.debug(f"Found {len(all_claims_db)} claims in DB.")

    try:
        logger.debug("Fetching policy details for claims aggregation.")
        policy_details_list = await fetch_policy_details()
        logger.debug(f"Fetched {len(policy_details_list)} policy details.")
    except HTTPException as e:
        # Re-raise if fetch_policy_details already prepared an HTTPException (e.g., service unavailable)
        logger.error(f"HTTPException while fetching policy details for aggregation: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Failed to fetch policy details for claims aggregation: {e}", exc_info=True)
        # Return a 503 if policy service is down or another error occurred
        raise HTTPException(status_code=503, detail="Could not retrieve policy details necessary for claim aggregation.")

    policy_info_map = {policy['policy_id']: policy for policy in policy_details_list}
    logger.debug(f"Created policy_info_map with {len(policy_info_map)} entries.")

    customer_aggregated_claims = {}
    logger.debug("Starting aggregation of claims by customer.")
    for claim_db_obj_index, claim_db_obj in enumerate(all_claims_db):
            logger.debug(f"Processing claim {claim_db_obj_index + 1}/{len(all_claims_db)}: ID {claim_db_obj.id}")
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
                logger.debug(f"Found period {period} for policy_id {policy_id} (Claim ID {claim_db_obj.id}).")
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
                logger.debug(f"Attempting to create ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id} with data: {data_for_output_schema}")
                claim_output_item = ClaimDetailForCustomerOutputSchema(**data_for_output_schema)
                logger.debug(f"Successfully created ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id}")
            except Exception as e: # Ideally, catch pydantic.ValidationError
                logger.error(f"Error creating ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id}: {e}. Data: {data_for_output_schema}", exc_info=True)
                continue # Skip this claim

            if customer_id not in customer_aggregated_claims:
                customer_aggregated_claims[customer_id] = []
                logger.debug(f"Initialized claims list for new customer_id: {customer_id}")
            customer_aggregated_claims[customer_id].append(claim_output_item) # Append the validated schema instance
            logger.debug(f"Appended claim ID {claim_db_obj.id} to customer_id {customer_id}. Current claim count for customer: {len(customer_aggregated_claims[customer_id])}")

    if not customer_aggregated_claims:
        # If no *active* claims are found matching the criteria, return an empty list.
        # This is different from no claims in the system at all.
        logger.info("No customer aggregated claims to return after processing.")
        return []

    logger.debug(f"Preparing final result for {len(customer_aggregated_claims)} customers.")
    result = [
        CustomerClaimsSummarySchema(customer_id=cust_id, claims=claims_list)
        for cust_id, claims_list in customer_aggregated_claims.items()
    ]
    logger.info(f"Successfully aggregated claims for {len(result)} customers. Returning result.")
    return result

@router.get("/", responses={404: {"model": ErrorResponse}})
def get_all_claims_endpoint(db: Session = Depends(get_db)):
    logger.info("Received request to get all claims.")
    claims = get_all_claims(db)
    if not claims:
        logger.info("No claims found.")
        raise HTTPException(status_code=404, detail="No claims found")
    logger.info(f"Returning {len(claims)} claims.")
    return claims

@router.get("/{claim_id}", responses={404: {"model": ErrorResponse}})
def get_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    logger.info(f"Received request to get claim with ID: {claim_id}")
    claim = get_claim(db, claim_id)
    if not claim:
        logger.warning(f"Claim with ID {claim_id} not found.")
        raise HTTPException(status_code=404, detail="Claim not found")
    logger.info(f"Returning claim with ID: {claim_id}")
    return claim

@router.put("/{claim_id}/authorize", responses={404: {"model": ErrorResponse}})
def authorize_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    logger.info(f"Received request to authorize claim with ID: {claim_id}")
    claim = authorize_claim(db, claim_id)
    if not claim:
        logger.warning(f"Claim with ID {claim_id} not found for authorization.")
        raise HTTPException(status_code=404, detail="Claim not found")
    logger.info(f"Claim with ID {claim_id} authorized successfully.")
    return claim