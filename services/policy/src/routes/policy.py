from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database.db import get_db
from src.database.crud.policy_crud import (

    create_policy, change_status,
    get_policy, list_policies,
    get_policy_details, list_policy_details,
    get_policies_by_company,
    get_policy_by_enrollment,
    get_policies_by_user
)
from ..schemas.policy_schema import (
    PolicyCreateSchema, PolicySchema,
    PolicyDetailSchema, MessageSchema
)

router = APIRouter()

@router.post("/policy", response_model=PolicySchema)
def create_policy_endpoint(
    payload: PolicyCreateSchema,
    db: Session = Depends(get_db)
):
    return create_policy(db, payload.enrollment_id)

@router.post("/policy/{policy_id}/approve", response_model=PolicySchema)
def approve_policy(
    policy_id: int,
    db: Session = Depends(get_db)
):
    return change_status(db, policy_id, 'approved')

@router.post("/policy/{policy_id}/reject", response_model=PolicySchema)
def reject_policy(
    policy_id: int,
    db: Session = Depends(get_db)
):
    return change_status(db, policy_id, 'rejected')

@router.get("/policy/{policy_id}", response_model=PolicySchema)
def get_policy_endpoint(
    policy_id: int,
    db: Session = Depends(get_db)
):
    return get_policy(db, policy_id)

@router.get("/policy/{policy_id}/details", response_model=List[PolicyDetailSchema])
def get_policy_details_endpoint(
    policy_id: int,
    db: Session = Depends(get_db)
):
    return get_policy_details(db, policy_id)

@router.get("/policies/by-company/{company_id}", response_model=List[PolicySchema])
def get_policies_by_company_endpoint(
    company_id: int,
    db: Session = Depends(get_db)
):
    policies = get_policies_by_company(db, company_id)
    if not policies:
        raise HTTPException(status_code=404, detail="No policies found for this company")
    return policies

@router.get("/policies/by-user/{user_id}", response_model=List[PolicySchema])
def get_policies_by_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    policies = get_policies_by_user(db, user_id)
    if not policies:
        raise HTTPException(status_code=404, detail="No policies found for this user")
    return policies

@router.get("/policy/by-enrollment/{enrollment_id}", response_model=PolicySchema)
def get_policy_by_enrollment_endpoint(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    policy = get_policy_by_enrollment(db, enrollment_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found for this enrollment")
    return policy

@router.get("/policies", response_model=List[PolicySchema])
def list_policies_endpoint(
    db: Session = Depends(get_db)
):
    return list_policies(db)

@router.get("/policies/details", response_model=List[dict])
def list_policy_details_endpoint(
    db: Session = Depends(get_db)
):
    return list_policy_details(db)