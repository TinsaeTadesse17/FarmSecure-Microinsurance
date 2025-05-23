from typing import Union, List
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import httpx
import time
from src.database.db import SessionLocal
from src.schemas.claim_management_schema import (
    ClaimReadSchema,
    ErrorResponse,
    ClaimTriggerSchema
)
from typing import List
import httpx
from src.database.crud.claim_management_crud import (
    create_claim,
    get_all_claims,
    update_claim_status,
    update_claim_amount,
    get_claim,
    authorize_claim
)
from src.database.models.claim_management import ClaimStatusEnum, ClaimTypeEnum  # Import missing enums
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

def calculate_crop_claim_amount(ndvi_values: list[float], sum_insured: float):
    avg_ndvi = sum(ndvi_values) / len(ndvi_values)
    
    if avg_ndvi >= CROP_TRIGGER:
        return 0.0
    elif avg_ndvi <= CROP_EXIT:
        return sum_insured
    else:
        ratio = (CROP_TRIGGER - avg_ndvi) / (CROP_TRIGGER - CROP_EXIT)
        return round(ratio * sum_insured, 2)

def calculate_livestock_claim(z_score: float, sum_insured: float):
    if z_score >= LIVESTOCK_TRIGGER:
        return 0.0
    if z_score <= LIVESTOCK_EXIT:
        return sum_insured
    
    ratio = (LIVESTOCK_TRIGGER - z_score) / (LIVESTOCK_TRIGGER - LIVESTOCK_EXIT)
    claim_amount = ratio * sum_insured
    min_payment = LIVESTOCK_MP_PERCENT * sum_insured
    return max(claim_amount, min_payment)

async def process_claim(claim_id: int, claim_type: str, policy_data: dict):
    db = SessionLocal()
    try:
        cps_zone = policy_data['cps_zone']
        sum_insured = float(policy_data['period_sum_insured'])
        # fetch NDVI
        async with httpx.AsyncClient(timeout=timeout) as client:
            ndvi_resp = await client.get(f"{CONFIG_BASE}{settings.API_V1_STR}/ndvi/{cps_zone}")
            ndvi_resp.raise_for_status()
            ndvi_val = ndvi_resp.json().get('ndvi', 0.0)
        # calculate amount based on config thresholds
        if claim_type == ClaimTypeEnum.CROP.value:
            period = policy_data['period']
            async with httpx.AsyncClient(timeout=timeout) as client:
                cfg_resp = await client.get(f"{CONFIG_BASE}{settings.API_V1_STR}/cps_zone/{cps_zone}/{period}")
                cfg_resp.raise_for_status()
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
        raise HTTPException(400, "No valid crop policies found")
    for policy in crops:
        claim = create_claim(db, {
            "policy_id": policy['policy_id'],
            "customer_id": policy['customer_id'],
            "grid_id": policy['cps_zone'],
            "claim_type": ClaimTypeEnum.CROP.value,
            "status": ClaimStatusEnum.PROCESSING.value
        })
        background_tasks.add_task(
            process_claim,
            claim.id,
            ClaimTypeEnum.CROP.value,
            policy
        )
    return {"message": "Claims are being processed."}

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
        claim = create_claim(db, {
            "policy_id": policy['policy_id'],
            "customer_id": policy['customer_id'],
            "grid_id": policy['cps_zone'],
            "claim_type": ClaimTypeEnum.LIVESTOCK.value,
            "status": ClaimStatusEnum.PROCESSING.value
        })
        background_tasks.add_task(
            process_claim,
            claim.id,
            ClaimTypeEnum.LIVESTOCK.value,
            policy
        )
    return {"message": "Claims are being processed."}

@router.post("/claims/trigger", response_model=List[ClaimReadSchema])
async def trigger_claims(
    trigger: ClaimTriggerSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policies = await fetch_policy_details()
    selected = [p for p in policies if p.get('customer_id') == trigger.customer_id and p.get('period') == trigger.period]
    if not selected:
        raise HTTPException(status_code=404, detail="No policies found for this customer and period")
    results = []
    for policy in selected:
        ctype = ClaimTypeEnum.CROP.value if policy.get('product_type') == 1 else ClaimTypeEnum.LIVESTOCK.value
        claim = create_claim(db, {
            "policy_id": policy['policy_id'],
            "customer_id": policy['customer_id'],
            "cps_zone": policy['cps_zone'],
            "claim_type": ctype,
            "status": ClaimStatusEnum.PROCESSING.value
        })
        cps = policy['cps_zone']; period = policy['period']
        async with httpx.AsyncClient(timeout=timeout) as client:
            cfg_resp = await client.get(f"{CONFIG_BASE}{settings.API_V1_STR}/cps_zone/{cps}/{period}")
            cfg_resp.raise_for_status()
            cfgj = cfg_resp.json()
        trig, exitp = cfgj.get('trigger_point', 0), cfgj.get('exit_point', 0)
        if trig == 0 and exitp == 0:
            update_claim_amount(db, claim.id, 0.0)
            update_claim_status(db, claim.id, ClaimStatusEnum.SETTLED.value)
        else:
            background_tasks.add_task(process_claim, claim.id, ctype, policy)
        results.append(claim)
    return results

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