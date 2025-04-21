from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.schemas.claim_management_schema import ClaimCreateSchema, ClaimReadSchema, ClaimTypeEnum
from src.database.crud.claim_management_crud import create_claim, get_claim, authorize_claim
from src.database.db import SessionLocal
from src.utils.external_services import (
    get_ndvi_index,
    get_trigger_and_exit_points,
    get_policy_details,
    calculate_crop_claim,
    calculate_livestock_claim,
    calculate_livestock_z_score
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/calculate/crop", response_model=ClaimReadSchema)
def calculate_crop_claim_endpoint(
    claim_in: ClaimCreateSchema, period: str = "growing_season", db: Session = Depends(get_db)
):
    if claim_in.claim_type != ClaimTypeEnum.CROP:
        raise HTTPException(status_code=400, detail="Claim type must be CROP for this endpoint.")

    # 1. Get NDVI index for the grid and period.
    ndvi_index = get_ndvi_index(claim_in.grid_id, period)
    # 2. Retrieve trigger and exit points.
    trigger, exit_point = get_trigger_and_exit_points(claim_in.grid_id, "CROP")
    # 3. Retrieve policy details (simulate Policy Administration Service).
    policy = get_policy_details(claim_in.policy_id)
    periods = policy.get("periods", [])
    if not periods:
        raise HTTPException(status_code=500, detail="Policy periods not defined.")
    sum_insured_period = policy["sumInsured"] / len(periods)
    # 4. Compute the claim amount.
    claim_amount = calculate_crop_claim(ndvi_index, trigger, exit_point, sum_insured_period)
    # 5. Persist the claim.
    claim = create_claim(db, claim_in, claim_amount)
    return claim

@router.post("/calculate/livestock", response_model=ClaimReadSchema)
def calculate_livestock_claim_endpoint(
    claim_in: ClaimCreateSchema, month: str = "current", db: Session = Depends(get_db)
):
    if claim_in.claim_type != ClaimTypeEnum.LIVESTOCK:
        raise HTTPException(status_code=400, detail="Claim type must be LIVESTOCK for this endpoint.")

    # 1. Compute the livestock z-score using NDVI data.
    z_score = calculate_livestock_z_score(claim_in.grid_id, month)
    # 2. Retrieve trigger and exit points (applied on z-score).
    trigger, exit_point = get_trigger_and_exit_points(claim_in.grid_id, "LIVESTOCK")
    # 3. Retrieve policy details.
    policy = get_policy_details(claim_in.policy_id)
    periods = policy.get("periods", [])
    if not periods:
        raise HTTPException(status_code=500, detail="Policy periods not defined.")
    sum_insured_period = policy["sumInsured"] / len(periods)
    # 4. Compute the claim amount.
    claim_amount = calculate_livestock_claim(z_score, trigger, exit_point, sum_insured_period)
    # 5. Persist the claim.
    claim = create_claim(db, claim_in, claim_amount)
    return claim

@router.get("/{claim_id}", response_model=ClaimReadSchema)
def get_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    claim = get_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.put("/{claim_id}/authorize", response_model=ClaimReadSchema)
def authorize_claim_endpoint(claim_id: int, db: Session = Depends(get_db)):
    """
    Authorize a claim by updating its status to 'authorized'.
    Payment Management Service will handle subsequent settlement.
    """
    claim = authorize_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim
