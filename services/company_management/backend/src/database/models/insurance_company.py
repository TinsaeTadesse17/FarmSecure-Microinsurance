# in this file write the database operations

from sqlalchemy import Column, Integer, String
from backend.src.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
