# src/database/crud/insurance_company_crud.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from src.database.models.customer import Customer
from src.schemas.customer_schema import CustomerRequest

class CustomerService:
    def __init__(self, db: Session):
        self.db = db
    def create_customer(self, customer: CustomerRequest):
        # Validate required non-empty fields
        if not customer.f_name.strip():
            raise HTTPException(status_code=400, detail="fist name cannot be empty")
        if not customer.m_name.strip():
            raise HTTPException(status_code=400, detail="middle name cannot be empty")
        if not customer.l_name.strip():
            raise HTTPException(status_code=400, detail="last name cannot be empty")
        if not customer.account_no.strip():
            raise HTTPException(status_code=400, detail="account number cannot be empty")
        if not customer.account_type.strip():
            raise HTTPException(status_code=400, detail="account type field cannot be empty")

        # Check for duplicate email
        duplicate_account_no = self.db.query(Customer).filter(Customer.account_no == customer.account_no).first()
        if duplicate_account_no:
            raise HTTPException(status_code=400, detail="This Account number already registered")

        # Create new instance from received data
        db_customer = Customer(
            f_name=customer.f_name,
            m_name=customer.m_name,
            l_name=customer.l_name,
            account_no=customer.account_no,
            account_type=customer.account_type,
        )
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return db_customer.customer_id

    