from pydantic import BaseModel
from typing import List

class RoleCreate(BaseModel):
    name: str

class RoleOut(BaseModel):
    id: int
    name: str
    permissions: List[str]

    class Config:
        orm_mode = True
