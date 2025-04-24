from typing import List, Optional
from pydantic import BaseModel

class PeriodAmount(BaseModel):
    period: str
    amount: float

class PolicyCreate(BaseModel):
    policy_id: str
    customer_id: str
    product_id: int
    sum_insured: float
    grid_id: str
    product_type: str  # crop/livestock

class PolicyResponse(BaseModel):
    id: int
    policy_id: str
    customer_id: str
    product_id: int
    sum_insured: float
    grid_id: str
    periods: List[PeriodAmount]
    status: str
