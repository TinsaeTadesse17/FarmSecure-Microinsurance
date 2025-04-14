from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    company_id = Column(Integer)
    roles = Column(String)  # Could be JSON or comma-separated string
    created_at = Column(DateTime, default=datetime.utcnow)
