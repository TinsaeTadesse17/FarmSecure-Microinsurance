from datetime import date
from pydantic import BaseModel, conint, Field
from enum import Enum
from typing import Optional

class ProductType(str, Enum):
    crop = "crop"
    livestock = "livestock"

# ── Input Schemas ────────────────────────────────────────────────────────────────────

class CPSZoneIn(BaseModel):
    zone_id: int = Field(..., gt=0)
    zone_name: str = Field(..., min_length=1, max_length=100)

class ProductIn(BaseModel):
    product_type: ProductType

    def __init__(self, **data):
        # Automatically convert all input fields to lowercase
        for field, value in data.items():
            if isinstance(value, str):
                data[field] = value.lower()
        super().__init__(**data)

class PeriodIn(BaseModel):
    period_id: int = Field(..., gt=0)
    period_name: str
    date_from: date
    date_to: date

class GrowingSeasonIn(BaseModel):
    season_id: int = Field(..., gt=0)
    season_type: str
    length: int
    date_from: date
    date_to: date
    zone_id: int
    product_id: int

class TriggerExitPointIn(BaseModel):
    zone_id: int
    product_id: int
    fiscal_year: conint(gt=1900)
    period_id: int
    growing_season_id: int
    trigger_point: int
    exit_point: int
    trigger_percentile: int
    exit_percentile: int
    elc: Optional[float]

class NDVICropIn(BaseModel):
    zone_id: int
    fiscal_year: conint(gt=1900)
    growing_season_id: Optional[int]
    period_id: int
    index_value: float

# ── Response Schema ─────────────────────────────────────────────────────────────────

class IngestSummary(BaseModel):
    zones_upserted: int
    products_upserted: int
    periods_upserted: int
    seasons_upserted: int
    triggers_created: int
    triggers_updated: int
    ndvi_task: str = "scheduled"
