# policy/src/routes/policy.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.crud.policy_crud import PolicyService
from src.schemas.policy_schema import PolicyCreate, PolicyResponse
from src.database.db import get_db
import asyncio
from logging import getLogger


logger = getLogger(__name__)
router = APIRouter()

logger.debug("Policy router initialized")

@router.post("/", response_model=PolicyResponse, status_code=201)
async def create_policy(
    policy_in: PolicyCreate,
    db: Session = Depends(get_db)
):
    service = PolicyService(db)
    try:
        return await service.create_policy(policy_in)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{policy_id}", response_model=PolicyResponse)
def read_policy(policy_id: int, db: Session = Depends(get_db)):
    service = PolicyService(db)
    db_pol = service.get_policy(policy_id)
    logger.debug(f"Fetched policy: {db_pol}")
    if db_pol is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    return db_pol

@router.put("/{policy_id}/approve", response_model=PolicyResponse)
def approve_policy(policy_id: int, db: Session = Depends(get_db)):
    service = PolicyService(db)
    db_pol = service.approve_policy(policy_id)
    if db_pol is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    return db_pol
