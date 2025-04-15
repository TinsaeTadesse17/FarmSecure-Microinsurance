from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    status: str | None = None
    role: str | None = None

class UserOut(BaseModel):
    user_id: int
    username: str
    status: str | None = None
    role: str | None = None

    class Config:
        from_attributes = True  
