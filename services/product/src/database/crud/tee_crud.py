from typing import List, Optional
from sqlalchemy.orm import Session
import src.database.models.excel_ingest as models

# Read-only CRUD operations for all models

def get_zones(db: Session, skip: int = 0, limit: int = 100) -> List[models.CPSZone]:
    """Fetch a list of CPS zones."""
    return db.query(models.CPSZone).offset(skip).limit(limit).all()


def get_zone(db: Session, zone_id: int) -> Optional[models.CPSZone]:
    """Fetch a single CPS zone by its ID."""
    return db.query(models.CPSZone).filter(models.CPSZone.zone_id == zone_id).first()


def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[models.Product]:
    """Fetch a list of products."""
    return db.query(models.Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    """Fetch a single product by its ID."""
    return db.query(models.Product).filter(models.Product.product_id == product_id).first()


def get_periods(db: Session, skip: int = 0, limit: int = 100) -> List[models.Period]:
    """Fetch a list of periods."""
    return db.query(models.Period).offset(skip).limit(limit).all()


def get_period(db: Session, period_id: int) -> Optional[models.Period]:
    """Fetch a single period by its ID."""
    return db.query(models.Period).filter(models.Period.period_id == period_id).first()


def get_growing_seasons(db: Session, skip: int = 0, limit: int = 100) -> List[models.GrowingSeason]:
    """Fetch a list of growing seasons."""
    return db.query(models.GrowingSeason).offset(skip).limit(limit).all()


def get_growing_season(db: Session, season_id: int) -> Optional[models.GrowingSeason]:
    """Fetch a single growing season by its ID."""
    return db.query(models.GrowingSeason).filter(models.GrowingSeason.season_id == season_id).first()


def get_ndvi_data(db: Session, skip: int = 0, limit: int = 100) -> List[models.NDVICrop]:
    """Fetch a list of NDVI crop data."""
    return db.query(models.NDVICrop).offset(skip).limit(limit).all()


def get_ndvi_by_zone(db: Session, zone_id: int) -> List[models.NDVICrop]:
    """Fetch NDVI data filtered by zone ID."""
    return db.query(models.NDVICrop).filter(models.NDVICrop.zone_id == zone_id).all()


def get_triggers(db: Session, skip: int = 0, limit: int = 100) -> List[models.TriggerExitPoint]:
    """Fetch a list of trigger-exit point records."""
    return db.query(models.TriggerExitPoint).offset(skip).limit(limit).all()


def get_trigger(db: Session, teid: int) -> Optional[models.TriggerExitPoint]:
    """Fetch a single trigger-exit point by its primary ID."""
    return db.query(models.TriggerExitPoint).filter(models.TriggerExitPoint.teid == teid).first()


def get_triggers_by_zone_and_product(
    db: Session, zone_id: int, product_id: int
) -> List[models.TriggerExitPoint]:
    """Fetch trigger-exit points filtered by zone ID and product ID."""
    return (
        db.query(models.TriggerExitPoint)
        .filter(
            models.TriggerExitPoint.zone_id == zone_id,
            models.TriggerExitPoint.product_id == product_id
        )
        .all()
    )
