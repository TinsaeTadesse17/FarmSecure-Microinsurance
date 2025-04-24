from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.db import SessionLocal
from src.schemas.policy_schema import PolicyCreate, PolicyResponse
from src.database.crud.policy_crud import create_policy, get_policy
import requests
from src.core.config import settings

router = APIRouter(prefix="/api/policies", tags=["Policies"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PolicyResponse)
def generate_policy(data: PolicyCreate, db: Session = Depends(get_db)):
    # Get product details from product_service
    res = requests.get(f"{settings.PRODUCT_SERVICE_URL}/api/products/{data.product_id}")
    if res.status_code != 200:
        raise HTTPException(status_code=400, detail="Product not found")
    product = res.json()

    # Calculate periods
    periods = []
    if data.product_type == "crop":
        num_periods = 12  # Default
        amount_per_period = data.sum_insured / num_periods
        periods = [{"period": f"period_{i+1}", "amount": amount_per_period} for i in range(num_periods)]
    elif data.product_type == "livestock":
        # 58% for LRLD (4 months), 42% for SRSD (3 months)
        lrld_amount = data.sum_insured * 0.58
        srsd_amount = data.sum_insured * 0.42
        lrld = [{"period": f"LRLD_month_{i+1}", "amount": lrld_amount / 4} for i in range(4)]
        srsd = [{"period": f"SRSD_month_{i+1}", "amount": srsd_amount / 3} for i in range(3)]
        periods = lrld + srsd

    return create_policy(db, data, periods)

@router.get("/{policy_id}", response_model=PolicyResponse)
def read_policy(policy_id: str, db: Session = Depends(get_db)):
    policy = get_policy(db, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy
