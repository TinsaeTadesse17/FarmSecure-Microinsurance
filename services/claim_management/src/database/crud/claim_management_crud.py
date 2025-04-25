from sqlalchemy.orm import Session
from src.database.models.claim_management import Claim, ClaimStatusEnum
from src.schemas.claim_management_schema import ClaimCreateSchema

def create_claim(db: Session, claim_in: ClaimCreateSchema, claim_amount: float):
    claim = Claim(
        policy_id=claim_in.policy_id,
        customer_id=claim_in.customer_id,#input
        grid_id=claim_in.grid_id,
        claim_type=claim_in.claim_type,#product_type
        claim_amount=claim_amount,
        status=ClaimStatusEnum.PENDING,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

def get_claim(db: Session, claim_id: int):
    return db.query(Claim).filter(Claim.id == claim_id).first()

def authorize_claim(db: Session, claim_id: int):
    claim = get_claim(db, claim_id)
    if claim:
        claim.status = ClaimStatusEnum.AUTHORIZED
        db.commit()
        db.refresh(claim)
    return claim
