from sqlalchemy.orm import Session
from src.database.models.policy import Policy
from src.schemas.policy_schema import PolicyCreate
import uuid

def create_policy(db: Session, policy_data: PolicyCreate, periods: list):
    policy = Policy(
        policy_id=policy_data.policy_id or str(uuid.uuid4()),
        customer_id=policy_data.customer_id,
        product_id=policy_data.product_id,
        sum_insured=policy_data.sum_insured,
        grid_id=policy_data.grid_id,
        periods=periods,
        status="pending"
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

def get_policy(db: Session, policy_id: str):
    return db.query(Policy).filter(Policy.policy_id == policy_id).first()
