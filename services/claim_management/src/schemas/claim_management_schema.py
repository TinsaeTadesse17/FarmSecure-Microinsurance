from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class ClaimTypeEnum(str, Enum):
    CROP = "CROP"
    LIVESTOCK = "LIVESTOCK"

class ClaimStatusEnum(str, Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    SETTLED = "settled"

class ClaimBaseSchema(BaseModel):
    policy_id: int
    customer_id: int
    grid_id: int
    claim_type: ClaimTypeEnum

class ClaimCreateSchema(ClaimBaseSchema):
    # No input for claim_amount as it is computed automatically.
    pass

class ClaimReadSchema(ClaimBaseSchema):
    id: int
    claim_amount: float
    status: ClaimStatusEnum
    calculated_at: datetime

    class Config:
        orm_mode = True

class ClaimAuthorizeSchema(BaseModel):
    status: ClaimStatusEnum = ClaimStatusEnum.AUTHORIZED
