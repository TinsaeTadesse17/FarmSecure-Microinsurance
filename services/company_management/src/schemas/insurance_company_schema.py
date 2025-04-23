from pydantic import BaseModel, EmailStr, constr
from typing import Literal, Optional
from datetime import date, datetime


class InsuranceCompanyBase(BaseModel):
    name: str
    licenseNo: str
    licensedBy: str
    operationDate: date
    capital: float
    country: str
    city: str
    phoneNo: str
    postalCode: str
    email: EmailStr
    status: Literal["pending", "approved", "subscribed"] = "pending"


class InsuranceCompanyCreate(InsuranceCompanyBase):
    pass

class InsuranceCompanyUpdate(BaseModel):
    name: Optional[str] = None
    licenseNo: Optional[str] = None
    licensedBy: Optional[str] = None
    operationDate: Optional[date] = None
    capital: Optional[float] = None
    country: Optional[str] = None
    city: Optional[str] = None
    phoneNo: Optional[str] = None
    postalCode: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[Literal["pending", "approved", "subscribed"]] = None


class InsuranceCompanyResponse(InsuranceCompanyBase):
    id: int
    createdAt: datetime

    class Config:
        orm_mode = True
class CrediencialResponse(BaseModel):
    username: str
    password: str
    class Config:
        orm_mode = True