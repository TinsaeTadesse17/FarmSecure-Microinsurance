from sqlalchemy import Column, Integer, String, Float
from src.database.db import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, index=True)
    name = Column(String, index=True)
    type = Column(String)  # e.g., 'crop' or 'livestock'
    elc = Column(Float)
    trigger_point = Column(Float, default=15.0)  # default 15%
    exit_point = Column(Float, default=5.0)      # default 5%
    commission_rate = Column(Float)
    load = Column(Float, nullable=True)
    discount = Column(Float, nullable=True)
    fiscal_year = Column(String, nullable=True)
    growing_season = Column(String, nullable=True)
    cps_zone = Column(String, nullable=True)
    period = Column(String, nullable=True)
