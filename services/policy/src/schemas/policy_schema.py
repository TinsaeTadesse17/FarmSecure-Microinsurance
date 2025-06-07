from pydantic import BaseModel
from typing import List, Optional

class PolicyDetailSchema(BaseModel):
    period: int
    company_id: int
    period_sum_insured: float

    class Config:
        orm_mode = True

class PolicySchema(BaseModel):
    policy_id: int
    enrollment_id: int
    user_id: int
    ic_company_id: int
    policy_no: str
    fiscal_year: str
    status: str
    details: List[PolicyDetailSchema] = []

    class Config:
        orm_mode = True

class PolicyCreateSchema(BaseModel):
    enrollment_id: int

class MessageSchema(BaseModel):
    message: str
