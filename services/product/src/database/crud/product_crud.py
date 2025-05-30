# src/database/crud/product_crud.py

from sqlalchemy.orm import Session
from src.database.models.product import ProductConfig as Product
from src.database.models.excel_ingest import TriggerExitPoint
from src.schemas.product_schema import ProductCreate, ProductUpdate

# defaults
DEFAULT_TRIGGER = 15.0
DEFAULT_EXIT = 5.0
DEFAULT_ELC = 10.0

def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()  # filter(Product.product_id == product_id).

def get_products_by_company(db: Session, company_id: int):
    return db.query(Product).filter(Product.company_id == company_id).all()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> list[Product]:
    return db.query(Product).offset(skip).limit(limit).all()

def create_product(db: Session, payload: ProductCreate) -> Product:

    db_product = Product(
        company_id      = payload.company_id,
        name            = payload.name,
        type    = payload.type,
        elc             = payload.elc or DEFAULT_ELC,
        trigger_point   = payload.trigger_point if payload.trigger_point is not None else DEFAULT_TRIGGER,
        exit_point      = payload.exit_point if payload.exit_point is not None else DEFAULT_EXIT,
        commission_rate = payload.commission_rate,
        load            = payload.load,
        discount        = payload.discount,
        fiscal_year     = payload.fiscal_year,
        growing_season = payload.growing_season,
        cps_zone         = payload.cps_zone_id,
        period      = payload.period,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # 2) try to re-load trigger/exit/elc from TriggerExitPoint
    record = (
        db.query(TriggerExitPoint)
        .filter(
            str(TriggerExitPoint.zone_id)           == db_product.cps_zone,
            # TriggerExitPoint.product_id        == db_product.id,
            # TriggerExitPoint.fiscal_year       == db_product.fiscal_year,
            # TriggerExitPoint.period_id         == db_product.period,
            # TriggerExitPoint.growing_season_id == db_product.growing_season,
        )
        .order_by(TriggerExitPoint.fiscal_year.desc())
        .first()
    )
    print(f"create_product: record: {record}")
    if record:
        db_product.trigger_point = record.trigger_point
        db_product.exit_point    = record.exit_point
        db_product.elc           = record.elc or db_product.elc
        db.commit()
        db.refresh(db_product)

    return db_product

def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product | None:
    db_product = get_product(db, product_id)
    if not db_product:
        return None

    # apply any provided fields
    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(db_product, field, val)

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # re-fetch trigger/exit/elc if we have the necessary keys
    if (
        db_product.zone_id is not None
        and db_product.fiscal_year is not None
        and db_product.period_id is not None
        and db_product.growing_season_id is not None
    ):
        record = (
            db.query(TriggerExitPoint)
            .filter(
                TriggerExitPoint.zone_id           == db_product.zone_id,
                TriggerExitPoint.product_id        == db_product.product_id,
                TriggerExitPoint.fiscal_year       == db_product.fiscal_year,
                TriggerExitPoint.period_id         == db_product.period_id,
                TriggerExitPoint.growing_season_id == db_product.growing_season_id,
            )
            .order_by(TriggerExitPoint.fiscal_year.desc())
            .first()
        )
        if record:
            db_product.trigger_point = record.trigger_point
            db_product.exit_point    = record.exit_point
            db_product.elc           = record.elc or db_product.elc
            db.commit()
            db.refresh(db_product)

    return db_product
