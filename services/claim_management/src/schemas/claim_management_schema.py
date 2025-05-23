# src/schemas/claim_management_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import Dict
from enum import Enum

class ClaimTypeEnum(str, Enum):
    CROP = "CROP"
    LIVESTOCK = "LIVESTOCK"

class ClaimStatusEnum(str, Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    SETTLED = "settled"

class ClaimBase(BaseModel):
    policy_id: int
    customer_id: int
    cps_zone: int

class NDVIData(BaseModel):
    ndvi_data: Dict[str, float]
    period: str

class ClaimReadSchema(ClaimBase):
    id: int
    claim_type: str
    claim_amount: float
    status: str
    calculated_at: datetime
    
    class Config:
        orm_mode = True

class ErrorResponse(BaseModel):
    detail: str

class ClaimAuthorizeSchema(BaseModel):
    status: ClaimStatusEnum = ClaimStatusEnum.AUTHORIZED

class ClaimTriggerSchema(BaseModel):
    customer_id: int
    period: int
