from pydantic import BaseModel, Field, validator
from typing import Optional, List # Added List
import datetime

# Removed old CPSZone schemas (if they existed in this exact form before)
# class CPSZoneBase(BaseModel):
#     cps_zone: int = Field(..., ge=0, le=200)
#     trigger_point: float
#     exit_point: float
# 
# class CPSZoneCreate(CPSZoneBase):
#     pass
# 
# class CPSZoneUpdate(BaseModel):
#     trigger_point: Optional[float] = None
#     exit_point: Optional[float] = None
# 
# class CPSZoneInDBBase(CPSZoneBase):
#     id: int
#     created_at: datetime.datetime
#     updated_at: datetime.datetime
# 
#     class Config:
#         orm_mode = True # Pydantic V1
#         # from_attributes = True # Pydantic V2
# 
# class CPSZone(CPSZoneInDBBase):
#     pass
# 
# class CPSZoneResponse(BaseModel):
#     cps_zone: int
#     trigger_point: float
#     exit_point: float

class CPSZonePeriodConfigBase(BaseModel):
    cps_zone: int = Field(..., ge=0, le=200) # Assuming 0-200 based on usage
    period: int = Field(..., ge=1, le=36)
    trigger_point: float
    exit_point: float

class CPSZonePeriodConfigCreate(CPSZonePeriodConfigBase):
    pass

class CPSZonePeriodConfigUpdate(BaseModel):
    trigger_point: Optional[float] = None
    exit_point: Optional[float] = None

class CPSZonePeriodConfigInDBBase(CPSZonePeriodConfigBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True # Changed from orm_mode = True

class CPSZonePeriodConfig(CPSZonePeriodConfigInDBBase):
    pass

class CPSZonePeriodConfigResponse(BaseModel):
    id: int # Added id
    cps_zone: int
    period: int
    trigger_point: float
    exit_point: float
    created_at: datetime.datetime # Added
    updated_at: datetime.datetime # Added

    class Config: # Added Config class
        from_attributes = True


class GrowingSeason(BaseModel):
    cps_zone: int = Field(..., ge=0, le=200) # Assuming 0-200 based on usage
    start_period: int = Field(..., ge=1, le=36)
    end_period: int = Field(..., ge=1, le=36)

    @validator('end_period')
    def end_period_must_be_greater_than_or_equal_to_start_period(cls, v, values):
        if 'start_period' in values and v < values['start_period']:
            raise ValueError('end_period must be greater than or equal to start_period')
        return v

class FileUploadResponse(BaseModel):
    message: str
    trigger_file_saved_as: Optional[str] = None
    exit_file_saved_as: Optional[str] = None
    growing_season_file_saved_as: Optional[str] = None
    files_metadata_ids: List[int] = [] # Store IDs of UploadedFile records

    class Config: # Added Config class
        from_attributes = True
