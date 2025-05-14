from datetime import datetime
from pydantic import BaseModel

class EnrolementRequest(BaseModel):
    f_name: str
    m_name: str
    l_name: str
    account_no: str
    account_type: str
    user_id:int
    sum_insured: float
    ic_company_id: int
    branch_id: int
    premium: float
    date_from: datetime
    date_to: datetime
    receipt_no: str
    product_id: int
    cps_zone: int


class EnrolementResponse(BaseModel):
    enrolement_id: int
    customer_id: int
    createdAt: datetime = None
    user_id:int
    status: str
    ic_company_id: int
    branch_id: int
    premium: float
    sum_insured: float
    date_from: datetime
    date_to: datetime
    receipt_no: str
    product_id: int
    cps_zone: int