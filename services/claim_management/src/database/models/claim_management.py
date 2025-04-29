# src/database/models/claim_management.py
import enum
from sqlalchemy import Column, Integer, Float, String, DateTime, Enum, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ClaimTypeEnum(str, enum.Enum):
    CROP = "CROP"
    LIVESTOCK = "LIVESTOCK"

class ClaimStatusEnum(str, enum.Enum):
    PROCESSING = "processing"
    PENDING = "pending"
    AUTHORIZED = "authorized"
    SETTLED = "settled"
    FAILED = "failed"

class Claim(Base):
    __tablename__ = "claim"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, nullable=False)
    customer_id = Column(Integer, nullable=False)
    grid_id = Column(Integer, nullable=False)
    claim_type = Column(Enum(ClaimTypeEnum), nullable=False)
    claim_amount = Column(Float, default=0.0)
    status = Column(Enum(ClaimStatusEnum), default=ClaimStatusEnum.PROCESSING)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())