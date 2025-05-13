from typing import Union
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import httpx
from src.database.db import SessionLocal
from src.schemas.claim_management_schema import (
    ClaimReadSchema,
    ErrorResponse,
    NDVIData
)
import time
from src.database.crud.claim_management_crud import (
    create_claim,
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

async def fetch_policy_details():
    async with httpx.AsyncClient() as client:
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

async def process_claim(claim_id: int, claim_type: str, ndvi_data: dict, policy_data: dict):
    db = SessionLocal()
    try:
        cps_zone = str(policy_data.get('cps_zone'))
        if not cps_zone:
            logger.error("CPS zone not found in policy data.")
            update_claim_status(db, claim_id, ClaimStatusEnum.FAILED.value)
            return

        avg_ndvi = ndvi_data.get(cps_zone)
        if not avg_ndvi:
            logger.error(f"NDVI data not found for CPS zone {cps_zone}.")
            update_claim_status(db, claim_id, ClaimStatusEnum.FAILED.value)
            return

        sum_insured = float(policy_data['period_sum_insured'])
        
        if claim_type == ClaimTypeEnum.CROP:
            if avg_ndvi >= CROP_TRIGGER:
                amount = 0.0
            elif avg_ndvi <= CROP_EXIT:
                amount = sum_insured
            else:
                ratio = (CROP_TRIGGER - avg_ndvi) / (CROP_TRIGGER - CROP_EXIT)
                amount = ratio * sum_insured
        else:
            z_score = (avg_ndvi - 0.5) * 2  # Simplified z-score calculation
            amount = calculate_livestock_claim(z_score, sum_insured)

        update_claim_amount(db, claim_id, round(amount, 2))
        time.sleep(0.2)
        update_claim_status(db, claim_id, ClaimStatusEnum.PENDING.value)

    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}")
    finally:
        db.close()

@router.post("/claims/crop", response_model=dict)
async def create_crop_claim(
    ndvi_data: NDVIData,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policy_details = await fetch_policy_details()
    # filter by product_type - all should be 1
    policy_details = [p for p in policy_details if p['product_type'] == 1]
    if not policy_details:
        raise HTTPException(400, "No valid crop policies found")
    period = int(ndvi_data.period)
    if not (1 <= period <= 36):
        raise HTTPException(400, "Invalid period. Must be between 1 and 36.")
    # filter by period
    policy_details = [p for p in policy_details if p['period'] == period]
    
    for policy in policy_details:
        policy_id = policy['policy_id']
        customer_id = policy['customer_id']
        grid_id = policy['cps_zone']
        claim_type = ClaimTypeEnum.CROP.value
        status = ClaimStatusEnum.PROCESSING.value
        
        claim = create_claim(db, {
            "policy_id": policy_id,
            "customer_id": customer_id,
            "grid_id": grid_id,
            "claim_type": claim_type,
            "status": status
        })
    
        background_tasks.add_task(
            process_claim,
            claim_id=claim.id,
            claim_type=ClaimTypeEnum.CROP.value,
            ndvi_data=ndvi_data.ndvi_data,
            policy_data=policy
        )
    return {"message": "Claims are being processed."}

@router.post("/claims/livestock", response_model=dict)
async def create_livestock_claim(
    ndvi_data: NDVIData,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policies = await fetch_policy_details()
    # filter by product_type - all should be 2
    policies = [p for p in policies if p['product_type'] == 2]
    if not policies:
        raise HTTPException(400, "No valid livestock policies found")
    
    for policy in policies:
        policy_id = policy['policy_id']
        customer_id = policy['customer_id']
        grid_id = policy['cps_zone']
        claim_type =  ClaimTypeEnum.LIVESTOCK.value
        status = ClaimStatusEnum.PROCESSING.value
        
        claim = create_claim(db, {
            "policy_id": policy_id,
            "customer_id": customer_id,
            "grid_id": grid_id,
            "claim_type": claim_type,
            "status": status
        })

        background_tasks.add_task(
            process_claim,
            claim_id=claim.id,
            claim_type=ClaimTypeEnum.LIVESTOCK.value,
            ndvi_data=ndvi_data.ndvi_data,
            policy_data=policy
        )
    
    return {"message": "Claims are being processed."}

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