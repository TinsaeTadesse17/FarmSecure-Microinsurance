import enum
from sqlalchemy import Column, Integer, Float, DateTime, Enum, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ClaimTypeEnum(str, enum.Enum):
    CROP = "CROP"
    LIVESTOCK = "LIVESTOCK"

class ClaimStatusEnum(str, enum.Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    SETTLED = "settled"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, nullable=False)
    customer_id = Column(Integer, nullable=False)
    grid_id = Column(Integer, nullable=False)
    claim_type = Column(Enum(ClaimTypeEnum), nullable=False)
    claim_amount = Column(Float, nullable=False)
    status = Column(Enum(ClaimStatusEnum), nullable=False, default=ClaimStatusEnum.PENDING)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
