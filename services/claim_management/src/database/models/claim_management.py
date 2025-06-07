# src/database/models/claim_management.py
import enum
from sqlalchemy import Column, Integer, Float, DateTime, String, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ClaimTypeEnum(str, enum.Enum):
    CROP = "CROP"
    LIVESTOCK = "LIVESTOCK"

class ClaimStatusEnum(str, enum.Enum):
    PROCESSING = "PROCESSING"
    PENDING    = "PENDING"
    AUTHORIZED = "AUTHORIZED"
    SETTLED    = "SETTLED"
    FAILED     = "FAILED"

class Claim(Base):
    __tablename__ = "claim"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False)
    policy_id = Column(Integer, nullable=False)
    customer_id = Column(Integer, nullable=False)
    grid_id = Column(Integer, nullable=False)
    period = Column(Integer, nullable=False, index=True) # Added period column

    # Store enums as plain strings
    claim_type = Column(String, nullable=False)
    claim_amount = Column(Float, default=0.0)
    status = Column(String, default=ClaimStatusEnum.PROCESSING.value, nullable=False)

    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

