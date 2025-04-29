from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import httpx
from src.database.db import SessionLocal
from src.schemas.claim_management_schema import (
    CropClaimCreate,
    LivestockClaimCreate,
    ClaimReadSchema
)
from src.database.crud.claim_management_crud import (
    create_claim,
    update_claim_status,
    update_claim_amount,
    get_claim,
    authorize_claim
)
from src.database.models.claim_management import ClaimStatusEnum, ClaimTypeEnum  # Import missing enums

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
router = APIRouter()

# Static thresholds
CROP_TRIGGER = 0.15
CROP_EXIT = 0.05
LIVESTOCK_TRIGGER = 1.5
LIVESTOCK_EXIT = 0.5
LIVESTOCK_MP_PERCENT = 0.1  # Define minimum payment percentage

async def fetch_policy_details(policy_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"http://policy-service/api/policies/details",
                params={"policy_id": policy_id}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError:
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
        cps_zone = policy_data.get('cps_zone', '')
        relevant_ndvi = [v for k, v in ndvi_data.items() if cps_zone in k]
        
        if not relevant_ndvi:
            update_claim_status(db, claim_id, ClaimStatusEnum.FAILED)
            return

        sum_insured = float(policy_data['period_sum_insured'])
        
        if claim_type == ClaimTypeEnum.CROP:
            avg_ndvi = sum(relevant_ndvi) / len(relevant_ndvi)
            if avg_ndvi >= CROP_TRIGGER:
                amount = 0.0
            elif avg_ndvi <= CROP_EXIT:
                amount = sum_insured
            else:
                ratio = (CROP_TRIGGER - avg_ndvi) / (CROP_TRIGGER - CROP_EXIT)
                amount = ratio * sum_insured
        else:
            # Livestock calculation
            avg_ndvi = sum(relevant_ndvi) / len(relevant_ndvi)
            z_score = (avg_ndvi - 0.5) * 2  # Simplified z-score calculation
            amount = calculate_livestock_claim(z_score, sum_insured)

        update_claim_amount(db, claim_id, round(amount, 2))
        update_claim_status(db, claim_id, ClaimStatusEnum.PENDING)
        
    except Exception:
        update_claim_status(db, claim_id, ClaimStatusEnum.FAILED)
    finally:
        db.close()

@router.post("/claims/crop", response_model=ClaimReadSchema)
async def create_crop_claim(
    claim_data: CropClaimCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policy = await fetch_policy_details(claim_data.policy_id)
    
    if policy.get('product_type') != 1:
        raise HTTPException(400, "Invalid policy type for crop claim")
    
    claim = create_claim(db, {
        **claim_data.dict(),
        "claim_type": ClaimTypeEnum.CROP,
        "status": ClaimStatusEnum.PROCESSING
    })
    
    background_tasks.add_task(
        process_claim,
        claim_id=claim.id,
        claim_type=ClaimTypeEnum.CROP,
        ndvi_data=claim_data.ndvi_data,
        policy_data=policy
    )
    
    return claim

@router.post("/claims/livestock", response_model=ClaimReadSchema)
async def create_livestock_claim(
    claim_data: LivestockClaimCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    policy = await fetch_policy_details(claim_data.policy_id)
    
    if policy.get('product_type') != 2:
        raise HTTPException(400, "Invalid policy type for livestock claim")
    
    claim = create_claim(db, {
        **claim_data.dict(),
        "claim_type": ClaimTypeEnum.LIVESTOCK,
        "status": ClaimStatusEnum.PROCESSING
    })
    
    background_tasks.add_task(
        process_claim,
        claim_id=claim.id,
        claim_type=ClaimTypeEnum.LIVESTOCK,
        ndvi_data=claim_data.ndvi_data,
        policy_data=policy
    )
    
    return claim

@router.get("/{claim_id}", response_model=ClaimReadSchema)
def get_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    claim = get_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.put("/{claim_id}/authorize", response_model=ClaimReadSchema)
def authorize_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    claim = authorize_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim