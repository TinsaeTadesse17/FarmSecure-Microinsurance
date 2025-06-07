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
    company_id: int
    customer_id: int
    grid_id: int # Changed from cps_zone to grid_id
    period: int  # Added period

class NDVIData(BaseModel):
    ndvi_data: Dict[str, float]
    period: str

class ClaimReadSchema(ClaimBase):
    id: int
    claim_type: str
    claim_amount: float | None = None # Made nullable to match model default
    status: str
    calculated_at: datetime | None = None # Made nullable as server_default might not be available on read immediately or if not set
    # period is inherited from ClaimBase
    
    class Config:
        orm_mode = True

class ErrorResponse(BaseModel):
    detail: str

class ClaimAuthorizeSchema(BaseModel):
    status: ClaimStatusEnum = ClaimStatusEnum.AUTHORIZED

class ClaimTriggerSchema(BaseModel):
    customer_id: int
    period: int
