from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    company_id: int

class UserOut(BaseModel):
    id: int
    username: str
    company_id: int
    roles: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class RoleUpdate(BaseModel):
    roles: str
