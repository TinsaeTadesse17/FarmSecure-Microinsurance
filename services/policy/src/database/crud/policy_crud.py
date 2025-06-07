import os
import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..models.policy import Policy, PolicyDetail
from src.core.config import settings

DFS_SERVICE_URL = settings.DFS_SERVICE_URL 

def fetch_enrollment(enrollment_id: int) -> dict:
    try:
        resp = httpx.get(
            f"{DFS_SERVICE_URL}/api/enrollments/{enrollment_id}", timeout=5
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Enrollment (DFS) service error: {e}")

def create_policy(db: Session, enrollment_id: int) -> Policy:
    data = fetch_enrollment(enrollment_id)

    sum_insured = data.get('sum_insured')
    user_id = data.get('user_id')
    ic_company_id = data.get('ic_company_id')
    receipt_no = data.get('receipt_no')
    product_id = data.get('product_id')

    if None in (sum_insured, user_id, ic_company_id, receipt_no, product_id):
        raise HTTPException(status_code=400, detail="Invalid enrollment data")

    fiscal_year = str(datetime.utcnow().year)

    policy = Policy(
        enrollment_id=enrollment_id,
        user_id=user_id,
        ic_company_id=ic_company_id,
        policy_no=receipt_no,
        fiscal_year=fiscal_year,
        status='pending'
    )
    db.add(policy)
    db.flush()  # to populate policy.policy_id

    details = []
    if product_id == 2:
        # Livestock: 2 periods
        details.append(PolicyDetail(
            policy_id=policy.policy_id, period=1,
            company_id=policy.ic_company_id, 
            period_sum_insured=sum_insured * 0.58
        ))
        details.append(PolicyDetail(
            policy_id=policy.policy_id, period=2,
            company_id=policy.ic_company_id, 
            period_sum_insured=sum_insured * 0.42
        ))
    else:
        # Crop: 36 equal periods
        per_sum = sum_insured / 36
        for p in range(1, 37):
            details.append(PolicyDetail(
                policy_id=policy.policy_id,
                period=p,
                company_id=policy.ic_company_id,
                period_sum_insured=per_sum
            ))

    db.add_all(details)
    db.commit()
    db.refresh(policy)
    return policy


def change_status(db: Session, policy_id: int, new_status: str) -> Policy:
    policy = db.query(Policy).get(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.status = new_status
    db.commit()
    db.refresh(policy)
    return policy


def get_policy(db: Session, policy_id: int) -> Policy:
    policy = db.query(Policy).get(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


def get_policies_by_company(db: Session, company_id: int):
    return db.query(Policy).filter(Policy.ic_company_id == company_id).all()

def get_policies_by_user(db: Session, user_id: int):
    return db.query(Policy).filter(Policy.user_id == user_id).all()

def get_policy_by_enrollment(db: Session, enrollment_id: int):
    return db.query(Policy).filter(Policy.enrollment_id == enrollment_id).first()


def list_policies(db: Session):
    return db.query(Policy).all()


def get_policy_details(db: Session, policy_id: int):
    policy = get_policy(db, policy_id)
    return policy.details


def list_policy_details(db: Session):
    details = db.query(PolicyDetail).all()
    output = []
    for d in details:
        p = d.policy
        enrollment = fetch_enrollment(p.enrollment_id)
        output.append({
            'policy_detail_id': d.policy_detail_id,
            'company_id': p.ic_company_id,
            'customer_id': enrollment.get('customer_id'),
            'policy_id': p.policy_id,
            'period_sum_insured': float(d.period_sum_insured),
            'cps_zone': str(enrollment.get('cps_zone')),
            'grid': str(enrollment.get('grid')),
            'product_type': enrollment.get('product_id'),
            "period": d.period,
        })
    return output
