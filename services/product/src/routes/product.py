from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import logging

from src.database import db
from src.database.crud import product_crud
from src.schemas import product_schema

router = APIRouter(prefix="/api/products", tags=["products"])
logger = logging.getLogger(__name__)

@router.post("", response_model=product_schema.ProductResponse)
def create_product(product: product_schema.ProductCreate, db: Session = Depends(db.get_db)):
    try:
        # (Optional) validate company via Company Management Service
        db_product = product_crud.create_product(db, product)
        return db_product
    except Exception as e:
        logger.error(f"Error in create_product: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error creating product.")

@router.put("/{product_id}", response_model=product_schema.ProductResponse)
def update_product(product_id: int, product: product_schema.ProductUpdate, db: Session = Depends(db.get_db)):
    try:
        db_product = product_crud.update_product(db, product_id, product)
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_product: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error updating product.")

@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def get_product(product_id: int, db: Session = Depends(db.get_db)):
    try:
        db_product = product_crud.get_product(db, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_product: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error retrieving product.")

@router.post("/{product_id}/calculate-premium", response_model=product_schema.PremiumCalculation)
def calculate_premium(product_id: int, db: Session = Depends(db.get_db)):
    try:
        db_product = product_crud.get_product(db, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Use default trigger_point and exit_point if not provided
        trigger = db_product.trigger_point if db_product.trigger_point is not None else 15.0
        exit_ = db_product.exit_point if db_product.exit_point is not None else 5.0
        
        # Example premium calculation formula
        base_premium = db_product.elc * ((trigger + exit_) / 100)
        commission = db_product.commission_rate * db_product.elc
        premium = base_premium + commission

        return product_schema.PremiumCalculation(premium=premium)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in calculate_premium: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error calculating premium.")
