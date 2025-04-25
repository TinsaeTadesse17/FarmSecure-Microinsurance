# policy/src/schemas/policy_schema.py
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class PolicyStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class PeriodItem(BaseModel):
    period: str
    amount: float

class PolicyBase(BaseModel):
    customer_id: int
    product_id: int
    policy_id: str
    sum_insured: float

class PolicyCreate(PolicyBase):
    pass

class PolicyResponse(PolicyBase):
    id: int
    periods: list[PeriodItem]
    status: PolicyStatus
    created_at: datetime

    class Config:
        orm_mode = True
