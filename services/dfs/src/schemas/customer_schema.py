from pydantic import BaseModel

class CustomerRequest(BaseModel):
    f_name: str
    m_name: str
    l_name: str
    account_no: str
    account_type: str
class CustomerResponse(BaseModel):
    customer_id: int
    f_name: str
    m_name: str
    l_name: str
    account_no: str
    account_type: str
