from pydantic import BaseModel, ConfigDict
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
    company_id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    elc: Optional[float] = None
    trigger_point: Optional[float] = None
    exit_point: Optional[float] = None
    commission_rate: Optional[float] = None
    load: Optional[float] = None
    discount: Optional[float] = None
    fiscal_year: Optional[str] = None
    growing_season: Optional[str] = None
    cps_zone: Optional[str] = None
    period: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Schema for premium calculation request/response
class PremiumCalculation(BaseModel):
    premium: float
