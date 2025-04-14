from sqlalchemy.orm import Session
from src.database.models.product import Product
from src.schemas.product_schema import ProductCreate, ProductUpdate

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product: ProductCreate):
    db_product = Product(
        company_id=product.company_id,
        name=product.name,
        type=product.type,
        elc=product.elc,
        trigger_point=product.trigger_point if product.trigger_point is not None else 15.0,
        exit_point=product.exit_point if product.exit_point is not None else 5.0,
        commission_rate=product.commission_rate,
        load=product.load,
        discount=product.discount,
        fiscal_year=product.fiscal_year,
        growing_season=product.growing_season,
        cps_zone=product.cps_zone,
        period=product.period,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    update_data = product.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product
