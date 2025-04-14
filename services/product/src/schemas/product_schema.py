from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    company_id: int
    name: str
    type: str  # 'crop' or 'livestock'
    elc: float
    trigger_point: Optional[float] = 15.0
    exit_point: Optional[float] = 5.0
    commission_rate: float
    load: Optional[float] = None
    discount: Optional[float] = None
    fiscal_year: Optional[str] = None
    growing_season: Optional[str] = None
    cps_zone: Optional[str] = None
    period: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    company_id: Optional[int]
    name: Optional[str]
    type: Optional[str]
    elc: Optional[float]
    trigger_point: Optional[float]
    exit_point: Optional[float]
    commission_rate: Optional[float]
    load: Optional[float]
    discount: Optional[float]
    fiscal_year: Optional[str]
    growing_season: Optional[str]
    cps_zone: Optional[str]
    period: Optional[str]

class ProductResponse(ProductBase):
    id: int

    class Config:
        orm_mode = True

# Schema for premium calculation request/response
class PremiumCalculation(BaseModel):
    premium: float
