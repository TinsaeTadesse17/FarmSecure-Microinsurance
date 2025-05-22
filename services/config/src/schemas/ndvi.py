from pydantic import BaseModel, Field
from typing import Optional
import datetime

class NDVIBase(BaseModel):
    grid: int = Field(..., ge=0) # Assuming grid ID is non-negative
    ndvi: float

class NDVICreate(NDVIBase):
    pass

class NDVIUpdate(BaseModel):
    ndvi: Optional[float] = None

class NDVIInDBBase(NDVIBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True # Changed from orm_mode = True

class NDVI(NDVIInDBBase):
    pass

class NDVIResponse(BaseModel):
    id: int # Added id
    grid: int
    ndvi: float
    created_at: datetime.datetime # Added
    updated_at: datetime.datetime # Added
    
    class Config: # Added Config class
        from_attributes = True
