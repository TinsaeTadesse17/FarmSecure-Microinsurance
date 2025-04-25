# policy/src/database/models/policy.py
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Enum
from sqlalchemy.sql import func
from src.database.db import Base

class PolicyStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=False)
    policy_id = Column(String, unique=True, nullable=False)
    sum_insured = Column(Float, nullable=False)
    periods = Column(JSON, nullable=False)
    status = Column(Enum(PolicyStatus), default=PolicyStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
