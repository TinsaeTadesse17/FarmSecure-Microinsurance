from sqlalchemy import Column, Integer, String, CheckConstraint
from src.database.db import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, )
    username = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    status = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'agent')", name="check_valid_role"),
    )
