# src/database/crud/claim_management_crud.py
from sqlalchemy.orm import Session
from src.database.models.claim_management import Claim, ClaimStatusEnum

def create_claim(db: Session, claim_data: dict):
    claim = Claim(**claim_data)
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

def update_claim_status(db: Session, claim_id: int, status: str):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if claim:
        claim.status = status
        db.commit()
        return claim
    return None

def update_claim_amount(db: Session, claim_id: int, amount: float):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if claim:
        claim.claim_amount = amount
        db.commit()
        return claim
    return None

def get_claim(db: Session, claim_id: int):
    return db.query(Claim).filter(Claim.id == claim_id).first()

def get_claims(db: Session):
    return db.query(Claim).all()

def authorize_claim(db: Session, claim_id: int):
    claim = get_claim(db, claim_id)
    if claim:
        claim.status = ClaimStatusEnum.AUTHORIZED
        db.add(claim)
        db.commit()
        db.refresh(claim)
        return claim
    return None


