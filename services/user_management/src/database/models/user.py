from sqlalchemy import Column, Integer, String, CheckConstraint, Boolean
from src.database.db import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, )
    username = Column(String(100), nullable=False, unique=True) 
    password = Column(String(100), nullable=False)           
    must_change_password = Column(Boolean, default=True)        
    status = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)

 
    company_id = Column(Integer, nullable=True)

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'agent', 'ic')", name="check_valid_role"),
    )
