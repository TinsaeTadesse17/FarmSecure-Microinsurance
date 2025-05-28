# src/api/product_route.py

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
import logging

from src.database import db
from src.database.crud.product_crud import (
    get_product,
    get_products,
    create_product,
    update_product,
    get_products_by_company
)
from src.database.models.excel_ingest import TriggerExitPoint
from src.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PremiumCalculation,
)
from src.schemas.excel_ingest import ProductType

router = APIRouter(prefix="/products", tags=["products"])
logger = logging.getLogger(__name__)

@router.get("", response_model=list[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(db.get_db),
):
    return get_products(db, skip, limit)

@router.get("/{product_id}", response_model=ProductResponse)
def read_product(
    product_id: int,
    db: Session = Depends(db.get_db),
):
    prod = get_product(db, product_id)
    if not prod:
        raise HTTPException(404, "Product not found")
    return prod

@router.get("/by-company/{company_id}", response_model=list[ProductResponse])
def get_products_by_company_route(
    company_id: int,
    db: Session = Depends(db.get_db),
):
    products = get_products_by_company(db, company_id)
    if not products:
        raise HTTPException(404, "No products found for the specified company")
    return products

@router.post("", response_model=ProductResponse)
def create_product_route(
    payload: ProductCreate,
    db: Session = Depends(db.get_db),
):
    try:
        # enum validation
        if not isinstance(payload.type, ProductType):
            raise HTTPException(400, "Invalid product type")

        return create_product(db, payload)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}", exc_info=True)
        raise HTTPException(500, "Error creating product")

@router.put("/{product_id}", response_model=ProductResponse)
def update_product_route(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(db.get_db),
):
    try:
        updated = update_product(db, product_id, payload)
        if not updated:
            raise HTTPException(404, "Product not found")
        return updated

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {e}", exc_info=True)
        raise HTTPException(500, "Error updating product")

@router.post("/{product_id}/calculate-premium", response_model=PremiumCalculation)
def calculate_premium(
    product_id: int,
    zone_id: int            = Query(..., description="CPS zone ID"),
    fiscal_year: int        = Query(..., description="Fiscal year"),
    period_id: int          = Query(..., description="Period ID"),
    growing_season_id: int  = Query(..., description="Growing season ID"),
    db: Session             = Depends(db.get_db),
):
    prod = get_product(db, product_id)
    if not prod:
        raise HTTPException(404, "Product not found")

    # fetch the matching trigger record
    record = (
        db.query(TriggerExitPoint)
        .filter(
            TriggerExitPoint.zone_id           == zone_id,
            TriggerExitPoint.product_id        == product_id,
            TriggerExitPoint.fiscal_year       == fiscal_year,
            TriggerExitPoint.period_id         == period_id,
            TriggerExitPoint.growing_season_id == growing_season_id,
        )
        .order_by(TriggerExitPoint.fiscal_year.desc())
        .first()
    )

    # fallbacks
    trigger = record.trigger_point if record and record.trigger_point is not None else 15.0
    exit_   = record.exit_point    if record and record.exit_point is not None    else 5.0
    elc     = record.elc           if record and record.elc is not None           else 10.0

    # proper premium formula
    if record:
        loading_factor = (record.trigger_percentile + record.exit_percentile) / 100
    else:
        loading_factor = (trigger + exit_) / 100

    base_premium   = elc * loading_factor
    commission_amt = prod.commission_rate * elc
    premium        = base_premium + commission_amt

    return PremiumCalculation(premium=premium)