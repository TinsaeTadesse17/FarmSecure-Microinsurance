# File: src/database/crud/excel_ingest.py

import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.database.models.excel_ingest import (
    CPSZone, Product, Period,
    GrowingSeason, NDVICrop, TriggerExitPoint
)
from src.schemas.excel_ingest import (
    CPSZoneIn, ProductIn, PeriodIn,
    GrowingSeasonIn, TriggerExitPointIn, NDVICropIn
)

logger = logging.getLogger(__name__)

def upsert(
    db: Session, model, unique_attrs: dict, data: dict
) -> tuple:
    """
    Generic upsert: query by unique_attrs, then update or insert.
    Returns (instance, created_flag).
    """
    instance = db.query(model).filter_by(**unique_attrs).one_or_none()
    if instance:
        for k, v in data.items():
            setattr(instance, k, v)
        created = False
    else:
        instance = model(**data)
        db.add(instance)
        created = True
    return instance, created


def upsert_cps_zone(db: Session, inp: CPSZoneIn):
    return upsert(db, CPSZone, {"zone_id": inp.zone_id}, inp.model_dump())

def upsert_product(db: Session, inp: ProductIn):
    return upsert(db, Product, {"product_type": inp.product_type}, inp.model_dump())

def upsert_period(db: Session, inp: PeriodIn):
    return upsert(db, Period, {"period_id": inp.period_id}, inp.model_dump())

def upsert_growing_season(db: Session, inp: GrowingSeasonIn):
    return upsert(db, GrowingSeason, {"season_id": inp.season_id}, inp.model_dump())

def upsert_trigger(db: Session, inp: TriggerExitPointIn):
    data = inp.model_dump()
    unique = {
        "zone_id": data["zone_id"],
        "product_id": data["product_id"],
        "fiscal_year": data["fiscal_year"],
        "period_id": data["period_id"],
        "growing_season_id": data["growing_season_id"]
    }
    return upsert(db, TriggerExitPoint, unique, data)

def upsert_ndvi(db: Session, inp: NDVICropIn):
    data = inp.model_dump()
    unique = {
        "zone_id": data["zone_id"],
        "fiscal_year": data["fiscal_year"],
        "period_id": data["period_id"],
        "growing_season_id": data["growing_season_id"]
    }
    return upsert(db, NDVICrop, unique, data)
