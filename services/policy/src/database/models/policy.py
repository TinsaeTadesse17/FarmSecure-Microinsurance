from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from src.database.db import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(String, unique=True, index=True)
    customer_id = Column(String)
    product_id = Column(Integer)
    sum_insured = Column(Float)
    grid_id = Column(String)
    periods = Column(JSON)  # list of {"period": int, "amount": float}
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())
