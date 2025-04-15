from pydantic import BaseModel

class PermissionCreate(BaseModel):
    name: str

class PermissionOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True
