from fastapi import HTTPException, APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import time # Added import for time.sleep
import json # Added for pretty printing
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
    print("Starting process_all_claims_task")
    db: Session = db_session_factory()
    try:
        print("Starting background task: process_all_claims_task")
        try:
            print("Fetching policy details in process_all_claims_task")
            policies = await fetch_policy_details()
            # print(f"Fetched {len(policies) if policies else 0} policy details:\\n{json.dumps(policies, indent=4)}")
        except HTTPException as e:
            print(f"Could not fetch policy details: {e.detail}")
            return
        if not policies:
            print("No policies found to process in background task.")
            return

        print(f"Found {len(policies)} policies to process.")

        for policy_index, policy in enumerate(policies):
            claim_id_for_logging = "N/A"
            try:
                print(f"Processing policy {policy_index + 1}/{len(policies)}: {policy.get('policy_id')}")
                
                required_keys = ['policy_id', 'customer_id', 'cps_zone', 'period', 'product_type', 'period_sum_insured']
                if not all(policy.get(k) is not None for k in required_keys):
                    print(f"Skipping policy due to missing essential details: Policy Data {policy}")
                    continue

                current_policy_id = policy['policy_id']
                current_period = policy['period']
                ctype = ClaimTypeEnum.CROP.value if policy.get('product_type') == 1 else ClaimTypeEnum.LIVESTOCK.value

                # Check if a claim for this policy_id and period already exists
                print(f"Checking for existing claim for policy_id {current_policy_id} and period {current_period}")
                existing_claim = db.query(Claim).filter(
                    Claim.policy_id == current_policy_id,
                    Claim.period == current_period 
                ).first()
                
                claim_data = {
                    "policy_id": current_policy_id,
                    "company_id": policy.get('company_id'),  # Ensure company_id is included
                    "customer_id": policy['customer_id'],
                    "grid_id": policy.get('grid') or policy['cps_zone'], 
                    "claim_type": ctype,
                    "status": ClaimStatusEnum.PROCESSING.value,
                    "period": current_period  # Added period to claim_data
                }
                print(f"Creating claim with data: {claim_data}")
                if existing_claim:
                    print(f"Claim already exists for policy_id {current_policy_id} and period {current_period} (Claim ID: {existing_claim.id}). Skipping creation.")
                    created_claim = existing_claim
                else:
                    created_claim = create_claim(db, claim_data)
                # Assuming create_claim commits and refreshes, so created_claim.id is an int.
                # If type errors persist here, it's a static analysis issue with model/CRUD typing.
                
                if not created_claim or not isinstance(created_claim.id, int):
                    print(f"Failed to create claim or retrieve valid claim ID for policy: {policy.get('policy_id')}")
                    continue
                
                claim_id_for_logging = created_claim.id # For logging in subsequent error blocks
                print(f"Successfully created claim with ID: {claim_id_for_logging} for policy_id: {current_policy_id}")

                cps = int(policy['cps_zone'])
                period = int(policy['period'])
                grid = int(policy['grid'])

                try:
                    print(f"Fetching CPS config for CPS {cps}, period {period} for claim {claim_id_for_logging}")
                    cfgj = await fetch_cps_config(int(cps), int(period))
                    print(f"Fetched CPS config: {cfgj} for claim {claim_id_for_logging}")
                except HTTPException as e:
                    logger.warning(f"Config service error for CPS {cps}, period {period}: {e.detail}. Claim {claim_id_for_logging} will be settled with 0 amount.")
                    update_claim_amount(db, created_claim.id, 0.0)
                    update_claim_status(db, created_claim.id, ClaimStatusEnum.SETTLED.value)
                    print(f"Claim {claim_id_for_logging} settled due to config service error.")
                    continue
                trig, exitp = cfgj.get('trigger_point', 0), cfgj.get('exit_point', 0)

                if trig == 0 or exitp == 0:
                    print(f"Trigger or exit point is 0 for claim {claim_id_for_logging} (trig: {trig}, exitp: {exitp}). Settling claim with 0 amount.")
                    update_claim_amount(db, created_claim.id, 0.0)
                    update_claim_status(db, created_claim.id, ClaimStatusEnum.SETTLED.value)
                    print(f"Claim {claim_id_for_logging} settled.")
                else:
                    print(f"Adding process_claim task to background for claim ID: {created_claim.id}")
                    background_tasks_parent.add_task(process_claim, created_claim.id, ctype, policy)
            
            except HTTPException as e:
                print(f"Service error for policy {policy.get('policy_id', 'N/A')} (Claim ID: {claim_id_for_logging}): {e.detail}")
                if isinstance(claim_id_for_logging, int):
                    print(f"Attempting to settle claim {claim_id_for_logging} due to service error.")
                    update_claim_amount(db, claim_id_for_logging, 0.0)
                    update_claim_status(db, claim_id_for_logging, ClaimStatusEnum.SETTLED.value)
                    print(f"Claim {claim_id_for_logging} settled due to service error.")
            except Exception as e:
                logger.exception(f"Unexpected error processing policy {policy.get('policy_id', 'N/A')} (Claim ID: {claim_id_for_logging}): {e}", exc_info=True)
                if isinstance(claim_id_for_logging, int):
                    print(f"Attempting to settle claim {claim_id_for_logging} due to unexpected error.")
                    update_claim_amount(db, claim_id_for_logging, 0.0)
                    update_claim_status(db, claim_id_for_logging, ClaimStatusEnum.SETTLED.value)
                    print(f"Claim {claim_id_for_logging} settled due to unexpected error.")
        
        print("Finished background task: process_all_claims_task")
    
    except Exception as e:
        logger.exception(f"General error in process_all_claims_task: {e}", exc_info=True)
    finally:
        if db:
            db.close()
            print("Database session closed for process_all_claims_task.")
    print("Exiting process_all_claims_task")

# Define the new output schema for individual claims within the customer aggregation
class ClaimDetailForCustomerOutputSchema(BaseModel):
    # Explicitly list fields for the output, EXCLUDING cps_zone
    id: int
    policy_id: int
    company_id: int | None = None # Assuming these might be on the DB object
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
    """
    1. Extract grid, period, cps_zone, sum_insured from policy_data.
    2. Fetch CPS config using cps_zone and period → get trigger & exit points.
    3. If crop claim:
         a. Fetch growing season for grid, check if period is in season.
         b. If in season, fetch NDVI for (grid, period). Else settle with zero.
       If livestock claim:
         a. Fetch NDVI for (grid, period).
    4. Calculate claim amount (crop or livestock) and update database.
    5. On any external‐service failure, settle claim with amount = 0.
    """
    logger.info(f"process_claim started: claim_id={claim_id}, type={claim_type}")

    db: Session = SessionLocal()
    try:
        # 1) Parse inputs
        grid = int(policy_data["grid"])
        period = int(policy_data["period"])
        cps_zone = int(policy_data["cps_zone"])
        sum_insured = float(policy_data["period_sum_insured"])

        # 2) Fetch CPS configuration (trigger_point, exit_point)
        try:
            cfg = await fetch_cps_config(cps_zone, period)
            trigger_point = cfg.get("trigger_point", 0)
            exit_point = cfg.get("exit_point", 0)
        except HTTPException as e:
            logger.warning(
                f"CPS config service error for cps_zone={cps_zone}, period={period}: {e.detail} "
                f"→ settling claim {claim_id} with 0."
            )
            update_claim_amount(db, claim_id, 0.0)
            update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
            return
        except Exception as e:
            logger.exception(
                f"Unexpected error fetching CPS config for claim {claim_id}: {e}", exc_info=True
            )
            update_claim_amount(db, claim_id, 0.0)
            update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
            return

        # If either trigger or exit is zero, we cannot calculate a crop‐based payout:
        if trigger_point == 0 or exit_point == 0:
            logger.warning(
                f"Trigger or exit point is zero (trigger={trigger_point}, exit={exit_point}) "
                f"for claim {claim_id} → settling with 0."
            )
            update_claim_amount(db, claim_id, 0.0)
            update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
            return

        # 3) Branch based on claim type
        if claim_type == ClaimTypeEnum.CROP.value:
            # 3a) Check if 'period' is in the growing season for this grid
            try:
                seasons = await fetch_growing_season(grid)
            except HTTPException as e:
                logger.warning(
                    f"Growing season service error for grid={grid}: {e.detail} "
                    f"→ settling claim {claim_id} with 0."
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return
            except Exception as e:
                logger.exception(
                    f"Unexpected error fetching growing season for claim {claim_id}: {e}",
                    exc_info=True,
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return

            if period not in seasons:
                logger.info(
                    f"Period {period} not in growing season {seasons} for claim {claim_id} "
                    f"(grid={grid}) → settling with 0."
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return

            # 3b) Fetch NDVI now that we know the period is valid
            try:
                ndvi_val = await fetch_ndvi(grid, period)
            except HTTPException as e:
                logger.warning(
                    f"NDVI service error for grid={grid}, period={period}: {e.detail} "
                    f"→ settling claim {claim_id} with 0."
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return
            except Exception as e:
                logger.exception(
                    f"Unexpected error fetching NDVI for claim {claim_id}: {e}", exc_info=True
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return

            # 3c) Calculate crop amount
            amount = calculate_crop_claim(
                ndvi_val, trigger_point, exit_point, sum_insured
            )
            logger.info(
                f"CROP claim {claim_id}: NDVI={ndvi_val}, trigger={trigger_point}, "
                f"exit={exit_point}, sum_insured={sum_insured} → amount={amount}"
            )

        else:  # LIVESTOCK
            # Always fetch NDVI (no growing‐season check for livestock)
            try:
                ndvi_val = await fetch_ndvi(grid, period)
            except HTTPException as e:
                logger.warning(
                    f"NDVI service error for grid={grid}, period={period}: {e.detail} "
                    f"→ settling claim {claim_id} with 0."
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return
            except Exception as e:
                logger.exception(
                    f"Unexpected error fetching NDVI for claim {claim_id}: {e}", exc_info=True
                )
                update_claim_amount(db, claim_id, 0.0)
                update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
                return

            # Compute a simple z‐score from NDVI (e.g. baseline ≈ 0.5)
            z_score = (ndvi_val - 0.5) * 2
            amount = calculate_livestock_claim(z_score, sum_insured)
            logger.info(
                f"LIVESTOCK claim {claim_id}: NDVI={ndvi_val}, z_score={z_score}, "
                f"sum_insured={sum_insured} → amount={amount}"
            )

        # 4) Update claim amount and set status to PENDING
        update_claim_amount(db, claim_id, amount)
        # A brief sleep (if truly needed for rate‐limiting) can be kept, otherwise remove
        time.sleep(0.2)
        update_claim_status(db, claim_id, ClaimStatusEnum.PENDING.value)
        logger.info(f"Claim {claim_id} updated: amount={amount}, status=PENDING")

    except Exception as e:
        # Anything unexpected: attempt to settle with zero
        logger.exception(f"Unexpected error in process_claim {claim_id}: {e}", exc_info=True)
        try:
            update_claim_amount(db, claim_id, 0.0)
            update_claim_status(db, claim_id, ClaimStatusEnum.SETTLED.value)
            logger.info(f"Claim {claim_id} settled (unexpected internal error).")
        except Exception as db_err:
            logger.error(f"Failed to settle claim {claim_id}: {db_err}", exc_info=True)

    finally:
        db.close()
        logger.info(f"Database session closed for claim {claim_id}.")

@router.post("/claims/crop", response_model=dict)
async def create_crop_claim(
    period: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    print(f"Received request to create crop claims for period: {period}")
    try:
        print("Fetching policy details for crop claims.")
        policy_details = await fetch_policy_details()
        print(f"Fetched {len(policy_details)} policy details:\n{json.dumps(policy_details, indent=4)}")
    except HTTPException as e:
        print(f"Failed to fetch policy details in create_crop_claim: {e.detail}")
        raise # Re-raise the exception to be handled by FastAPI
        
    crops = [p for p in policy_details if p['product_type'] == 1 and p['period'] == period]
    if not crops:
        logger.warning(f"No valid crop policies found for period {period}.")
        raise HTTPException(400, "No valid crop policies found for the specified period")
    
    print(f"Found {len(crops)} crop policies for period {period} to process.")
    processed_claims_count = 0
    for policy_index, policy in enumerate(crops):
        print(f"Processing crop policy {policy_index + 1}/{len(crops)}: {policy.get('policy_id')}")
        db.begin_nested() # Use a nested transaction for individual claim creation
        try:
            claim_data = {
                "company_id": policy['company_id'], # Ensure company_id is included
                "policy_id": policy['policy_id'],
                "customer_id": policy['customer_id'],
                "grid_id": policy.get('grid') or policy['cps_zone'], # Use 'grid' if available, else 'cps_zone'
                "claim_type": ClaimTypeEnum.CROP.value,
                "status": ClaimStatusEnum.PROCESSING.value,
                "period": policy['period'] # Ensure period is included
            }
            print(f"Creating crop claim with data: {claim_data}")
            claim_instance = create_claim(db, claim_data)
            db.commit() # Commit the nested transaction to get the ID
            print(f"Successfully created crop claim with ID: {claim_instance.id if claim_instance else 'N/A'} for policy_id: {policy.get('policy_id')}")
            
            if claim_instance and isinstance(claim_instance.id, int):
                print(f"Adding process_claim task to background for crop claim ID: {claim_instance.id}")
                background_tasks.add_task(
                    process_claim,
                    claim_instance.id, # Pass the integer ID
                    ClaimTypeEnum.CROP.value,
                    policy
                )
                processed_claims_count +=1
            else:
                print(f"Failed to create claim or get valid ID for policy {policy.get('policy_id')}")
                # Optionally, rollback the main transaction or handle error
        except Exception as e:
            db.rollback() # Rollback nested transaction on error
            print(f"Error creating claim for policy {policy.get('policy_id')}: {e}", exc_info=True)
            # Decide if to continue with other policies or raise an error

    print(f"Crop claims processing initiated for {processed_claims_count} policies for period {period}.")
    return {"message": "Crop claims processing initiated for the specified period."}

@router.post("/claims/livestock", response_model=dict)
async def create_livestock_claim(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    print("Received request to create livestock claims.")
    try:
        print("Fetching policy details for livestock claims.")
        policies = await fetch_policy_details()
        print(f"Fetched {len(policies)} policy details:\\n{json.dumps(policies, indent=4)}")
    except HTTPException as e:
        print(f"Failed to fetch policy details in create_livestock_claim: {e.detail}")
        raise

    livestocks = [p for p in policies if p['product_type'] == 2]
    if not livestocks:
        logger.warning("No valid livestock policies found.")
        raise HTTPException(400, "No valid livestock policies found")

    print(f"Found {len(livestocks)} livestock policies to process.")
    processed_claims_count = 0
    for policy_index, policy in enumerate(livestocks):
        print(f"Processing livestock policy {policy_index + 1}/{len(livestocks)}: {policy.get('policy_id')}")
        db.begin_nested()
        try:
            claim_data = {
                "company_id": policy['company_id'], # Ensure company_id is included
                "policy_id": policy['policy_id'],
                "customer_id": policy['customer_id'],
                "grid_id": policy.get('grid') or policy['cps_zone'], # Use 'grid' if available, else 'cps_zone'
                "claim_type": ClaimTypeEnum.LIVESTOCK.value,
                "status": ClaimStatusEnum.PROCESSING.value,
                "period": policy['period'] # Ensure period is included
            }
            print(f"Creating livestock claim with data: {claim_data}")
            claim_instance = create_claim(db, claim_data)
            db.commit()
            print(f"Successfully created livestock claim with ID: {claim_instance.id if claim_instance else 'N/A'} for policy_id: {policy.get('policy_id')}")

            if claim_instance and isinstance(claim_instance.id, int):
                print(f"Adding process_claim task to background for livestock claim ID: {claim_instance.id}")
                background_tasks.add_task(
                    process_claim,
                    claim_instance.id, # Pass the integer ID
                    ClaimTypeEnum.LIVESTOCK.value,
                    policy
                )
                processed_claims_count += 1
            else:
                print(f"Failed to create claim or get valid ID for policy {policy.get('policy_id')}")
        except Exception as e:
            db.rollback()
            print(f"Error creating claim for policy {policy.get('policy_id')}: {e}", exc_info=True)

    print(f"Livestock claims processing initiated for {processed_claims_count} policies.")
    return {"message": "Livestock claims processing initiated."}

@router.post("/claims/trigger", response_model=dict)
async def trigger_claims(
    background_tasks: BackgroundTasks
):
    """
    Triggers claim processing for all policies.
    This operation runs in the background.
    """
    print("Received request to /claims/trigger. Initiating background processing for all claims.")
    # Pass the SessionLocal factory and the current background_tasks instance
    background_tasks.add_task(process_all_claims_task, SessionLocal, background_tasks)
    print("process_all_claims_task added to background tasks.")
    return {"message": "Claim processing for all policies has been initiated in the background."}

@router.get("/claims/by-customer", response_model=List[CustomerClaimsSummarySchema], tags=["claims"] )
async def get_claims_grouped_by_customer(db: Session = Depends(get_db)):
    print("Received request to get claims grouped by customer.")
    print("Fetching all claims from DB.")
    all_claims_db = get_all_claims(db)
    if not all_claims_db:
        print("No claims found in the system.")
        raise HTTPException(status_code=404, detail="No claims found in the system.")
    print(f"Found {len(all_claims_db)} claims in DB.")

    try:
        print("Fetching policy details for claims aggregation.")
        policy_details_list = await fetch_policy_details()
        print(f"Fetched {len(policy_details_list)} policy details:\\n{json.dumps(policy_details_list, indent=4)}")
    except HTTPException as e:
        # Re-raise if fetch_policy_details already prepared an HTTPException (e.g., service unavailable)
        print(f"HTTPException while fetching policy details for aggregation: {e.detail}")
        raise e
    except Exception as e:
        print(f"Failed to fetch policy details for claims aggregation: {e}", exc_info=True)
        # Return a 503 if policy service is down or another error occurred
        raise HTTPException(status_code=503, detail="Could not retrieve policy details necessary for claim aggregation.")

    policy_info_map = {policy['policy_id']: policy for policy in policy_details_list}
    print(f"Created policy_info_map with {len(policy_info_map)} entries.")

    customer_aggregated_claims = {}
    print("Starting aggregation of claims by customer.")
    for claim_db_obj_index, claim_db_obj in enumerate(all_claims_db):
        print(f"Processing claim {claim_db_obj_index + 1}/{len(all_claims_db)}: ID {claim_db_obj.id}")
        if claim_db_obj.customer_id is None:
            logger.warning(f"Claim ID {claim_db_obj.id} has no customer_id, skipping for aggregation.")
            continue
        
        customer_id = claim_db_obj.customer_id
        policy_id = claim_db_obj.policy_id
        
        # Always use the period from the claim record itself
        period = getattr(claim_db_obj, 'period', None)

        data_for_output_schema = {
            "id": claim_db_obj.id,
            "company_id": claim_db_obj.company_id,
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
            print(f"Attempting to create ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id} with data: {data_for_output_schema}")
            claim_output_item = ClaimDetailForCustomerOutputSchema(**data_for_output_schema)
            print(f"Successfully created ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id}")
        except Exception as e:
            logger.exception(f"Error creating ClaimDetailForCustomerOutputSchema for claim ID {claim_db_obj.id}: {e}. Data: {data_for_output_schema}", exc_info=True)
            continue

        if customer_id not in customer_aggregated_claims:
            customer_aggregated_claims[customer_id] = []
            print(f"Initialized claims list for new customer_id: {customer_id}")
        customer_aggregated_claims[customer_id].append(claim_output_item)
        print(f"Appended claim ID {claim_db_obj.id} to customer_id {customer_id}. Current claim count for customer: {len(customer_aggregated_claims[customer_id])}")

    if not customer_aggregated_claims:
        # If no *active* claims are found matching the criteria, return an empty list.
        # This is different from no claims in the system at all.
        print("No customer aggregated claims to return after processing.")
        return []

    print(f"Preparing final result for {len(customer_aggregated_claims)} customers.")
    result = [
        CustomerClaimsSummarySchema(customer_id=cust_id, claims=claims_list)
        for cust_id, claims_list in customer_aggregated_claims.items()
    ]
    print(f"Successfully aggregated claims for {len(result)} customers. Returning result.")
    return result

@router.get("/", responses={404: {"model": ErrorResponse}})
def get_all_claims_endpoint(db: Session = Depends(get_db)):
    print("Received request to get all claims.")
    claims = get_all_claims(db)
    if not claims:
        print("No claims found.")
        raise HTTPException(status_code=404, detail="No claims found")
    print(f"Returning {len(claims)} claims.")
    return claims

@router.get("/{claim_id}", responses={404: {"model": ErrorResponse}})
def get_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    print(f"Received request to get claim with ID: {claim_id}")
    claim = get_claim(db, claim_id)
    if not claim:
        logger.warning(f"Claim with ID {claim_id} not found.")
        raise HTTPException(status_code=404, detail="Claim not found")
    print(f"Returning claim with ID: {claim_id}")
    return claim

@router.put("/{claim_id}/authorize", responses={404: {"model": ErrorResponse}})
def authorize_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    print(f"Received request to authorize claim with ID: {claim_id}")
    claim = authorize_claim(db, claim_id)
    if not claim:
        logger.warning(f"Claim with ID {claim_id} not found for authorization.")
        raise HTTPException(status_code=404, detail="Claim not found")
    print(f"Claim with ID {claim_id} authorized successfully.")
    return claim

@router.get("/claims/by-customer/{company_id}", response_model=List[CustomerClaimsSummarySchema], tags=["claims"])
async def get_claims_grouped_by_customer_and_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    print(f"Received request to get claims grouped by customer for company_id {company_id}.")
    all_claims_db = get_all_claims(db)
    if not all_claims_db:
        print("No claims found in the system.")
        raise HTTPException(status_code=404, detail="No claims found in the system.")

    # Filter claims by company_id
    filtered_claims = [claim for claim in all_claims_db if claim.company_id == company_id]
    print(f"Filtered down to {len(filtered_claims)} claims for company_id {company_id}.")

    if not filtered_claims:
        raise HTTPException(status_code=404, detail="No claims found for the specified company.")

    try:
        policy_details_list = await fetch_policy_details()
    except HTTPException as e:
        raise HTTPException(status_code=503, detail=f"Policy service unavailable: {e.detail}")
    except Exception as e:
        logger.exception("Failed to fetch policy details", exc_info=True)
        raise HTTPException(status_code=503, detail="Could not retrieve policy details.")

    policy_info_map = {policy['policy_id']: policy for policy in policy_details_list}
    customer_aggregated_claims = {}

    for claim_db_obj in filtered_claims:
        if claim_db_obj.customer_id is None:
            continue

        customer_id = claim_db_obj.customer_id
        policy_id = claim_db_obj.policy_id
        # Always use the period from the claim record itself
        period = getattr(claim_db_obj, 'period', None)

        claim_output_item = ClaimDetailForCustomerOutputSchema(
            id=claim_db_obj.id,
            company_id=claim_db_obj.company_id,
            policy_id=policy_id,
            grid_id=str(getattr(claim_db_obj, 'grid_id', None)),
            claim_type=claim_db_obj.claim_type,
            status=claim_db_obj.status,
            claim_amount=claim_db_obj.claim_amount,
            # created_at=claim_db_obj.created_at,
            # updated_at=claim_db_obj.updated_at,
            period=period
        )

        if customer_id not in customer_aggregated_claims:
            customer_aggregated_claims[customer_id] = []
        customer_aggregated_claims[customer_id].append(claim_output_item)

    result = [
        CustomerClaimsSummarySchema(customer_id=cust_id, claims=claims_list)
        for cust_id, claims_list in customer_aggregated_claims.items()
    ]
    print(f"Returning claims grouped for {len(result)} customers under company_id {company_id}.")
    return result