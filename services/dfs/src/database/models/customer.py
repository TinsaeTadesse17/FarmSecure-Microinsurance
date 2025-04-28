from sqlalchemy import Column, Integer, String,DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from src.database.db import Base




class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    f_name = Column(String, nullable=False)
    m_name = Column(String, nullable=False)
    l_name = Column(String, nullable=False)
    account_no = Column(String, nullable=False, unique=True)
    account_type = Column(String, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
