from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from src.database.db import Base


class CompanyStatus(str, PyEnum):
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from backend.src.database.db import Base


class CompanyStatus(PyEnum):
    pending = "pending"
    approved = "approved"
    subscribed = "subscribed"


class InsuranceCompany(Base):
    __tablename__ = "insurance_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    licenseNo = Column(String, nullable=False, unique=True)
    licensedBy = Column(String, nullable=False)
    operationDate = Column(Date, nullable=False)
    capital = Column(Float, nullable=False)
    country = Column(String, nullable=False)
    city = Column(String, nullable=False)
    phoneNo = Column(String, nullable=False, unique=True)
    postalCode = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    # Use SQLAlchemy's Enum here by aliasing it as SQLEnum
    status = Column(SQLEnum(CompanyStatus), default=CompanyStatus.pending, nullable=False)

    status = Column(Enum(CompanyStatus), default=CompanyStatus.pending, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
