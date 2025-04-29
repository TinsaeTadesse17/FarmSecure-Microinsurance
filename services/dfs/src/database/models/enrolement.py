from enum import Enum as PyEnum
from src.database.db import Base
from sqlalchemy import (Column, Integer, Numeric, Date, String, ForeignKey, func)
from sqlalchemy import Column, Integer, String, Date, Enum as SQLEnum

from sqlalchemy.orm import relationship
from src.database.db import Base



class EnrolementStatus(str, PyEnum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"




class Enrolement(Base):
    __tablename__ = "enrolements"

    enrolment_id = Column(Integer, primary_key=True, index=True)
    customer_id  = Column(Integer, ForeignKey("customers.customer_id"), nullable=False)
    user_id      = Column(Integer, nullable=False)
    ic_company_id= Column(Integer, nullable=False)
    branch_id    = Column(Integer, nullable=False)
    premium      = Column(Numeric(12, 2), nullable=False)
    sum_insured  = Column(Numeric(12, 2), nullable=False)
    date_from    = Column(Date, nullable=False)
    date_to      = Column(Date, nullable=False)
    receipt_no   = Column(String(10), nullable=False, unique=True)
    product_id   = Column(Integer,  nullable=False)
    status = Column(SQLEnum(EnrolementStatus), default=EnrolementStatus.pending, nullable=False)
    cps_zone     = Column(Integer, nullable=False)
    createdAt    = Column(Date, server_default=func.now(), nullable=False)
