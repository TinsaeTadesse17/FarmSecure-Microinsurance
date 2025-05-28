from pydantic import BaseModel, Field, validator
import datetime
from typing import Optional

class GrowingSeasonBase(BaseModel):
    grid: int = Field(..., ge=1, description="Grid identifier, must be 1 or greater.")
    start_period: int = Field(..., ge=1, le=36, description="Start period of the growing season (1-36).")
    end_period: int = Field(..., ge=1, le=36, description="End period of the growing season (1-36).")

    @validator('end_period')
    def end_period_must_be_gte_start_period(cls, v, values, **kwargs):
        if 'start_period' in values and v < values['start_period']:
            raise ValueError('end_period must be greater than or equal to start_period')
        return v

class GrowingSeasonCreate(GrowingSeasonBase):
    pass

class GrowingSeasonResponse(GrowingSeasonBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True # For Pydantic v1
        # from_attributes = True # For Pydantic v2 if you upgrade

class GrowingSeasonPeriodCheckResponse(BaseModel):
    growing_season: bool
