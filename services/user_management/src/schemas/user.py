from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    role: str
    company_id: Optional[int] = None  # Required for non-admins

class UserOut(BaseModel):
    user_id: int
    username: str
    status: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None

    class Config:
        from_attributes = True  # for SQLAlchemy model compatibility

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    status: Optional[str] = None
    # role: Optional[str] = None
    # company_id: Optional[int] = None
