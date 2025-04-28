# src/database/crud/insurance_company_crud.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from src.database.models.enrolement import Enrolement
from src.schemas.enrolement_schema import EnrolementRequest
from datetime import datetime
class EnrolementService:
    def __init__(self, db: Session):
        self.db = db
    def create_enrolement(self, enrolement: EnrolementRequest, customer_id:int):
        
        # Check for duplicate customer ID
        # 1. Prevent duplicate enrolment
        if self.db.query(Enrolement).filter(Enrolement.customer_id == customer_id).first():
            raise HTTPException(status_code=400, detail="Customer already enrolled")  # :contentReference[oaicite:0]{index=0}

        # 2. Validate integer fields
        for name in ("user_id", "ic_company_id", "branch_id", "product_id", "cps_zone"):
            val = getattr(enrolement, name)
            if not isinstance(val, int) or val <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{name} must be a positive integer"
                )  # :contentReference[oaicite:1]{index=1}

        # 3. Validate numeric fields
        if not isinstance(enrolement.premium, (float, int)) or enrolement.premium <= 0:
            raise HTTPException(status_code=400, detail="premium must be greater than zero")
        if not isinstance(enrolement.sum_insured, (float, int)) or enrolement.sum_insured <= 0:
            raise HTTPException(status_code=400, detail="sum_insured must be greater than zero")

        # 4. Validate date range
        if not isinstance(enrolement.date_from, datetime) or not isinstance(enrolement.date_to, datetime):
            raise HTTPException(status_code=400, detail="date_from and date_to must be valid datetimes")
        if enrolement.date_from >= enrolement.date_to:
            raise HTTPException(status_code=400, detail="date_from must be before date_to")

        # 5. Validate receipt_no string
        if not enrolement.receipt_no or not enrolement.receipt_no.strip():
            raise HTTPException(status_code=400, detail="receipt_no cannot be empty")  # :contentReference[oaicite:2]{index=2}

        
        
        
        # Create new instance from received data
        db_enrolement = Enrolement(
            customer_id = customer_id,
            cps_zone  = enrolement.cps_zone,
            user_id      = enrolement.user_id,
            ic_company_id= enrolement.ic_company_id,
            branch_id    = enrolement.branch_id,
            premium      = enrolement.premium,
            sum_insured  = enrolement.sum_insured,
            date_from    = enrolement.date_from,
            date_to      = enrolement.date_to,
            receipt_no   = enrolement.receipt_no,
            product_id   = enrolement.product_id,
        )
        self.db.add(db_enrolement)
        self.db.commit()
        self.db.refresh(db_enrolement)
        return db_enrolement

    def get_enrolement(self, enrolement_id: int):
        return self.db.query(Enrolement).filter(Enrolement.enrolment_id == enrolement_id).first()

    def get_enrolements(self, skip: int = 0, limit: int = 10):
        return self.db.query(Enrolement).offset(skip).limit(limit).all()

    def approve_enrolement(self, enrolement_id: int):
        db_company = self.db.query(Enrolement).filter(Enrolement.enrolment_id == enrolement_id).first()
        if not db_company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        
        db_company.status = "approved"

        self.db.commit()
        self.db.refresh(db_company)
        return db_company
    def reject_enrolement(self, enrolement_id: int):
        db_company = self.db.query(Enrolement).filter(Enrolement.enrolment_id == enrolement_id).first()
        if not db_company:
            raise HTTPException(status_code=404, detail=f"Enrolement with {enrolement_id} not found")
        
        
        db_company.status = "rejected"

        self.db.commit()
        self.db.refresh(db_company)
        return db_company