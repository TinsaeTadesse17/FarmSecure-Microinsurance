# src/database/crud/insurance_company_crud.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from src.database.models.enrolement import Enrolement
from src.schemas.enrolement_schema import EnrolementRequest
from datetime import datetime
from src.core.config import settings
import httpx
class EnrolementService:
    def __init__(self, db: Session):
        self.db = db
    def create_enrolement(self, enrolement, customer_id:int):
        
        # Check for duplicate customer ID
        # 1. Prevent duplicate enrolment
        if self.db.query(Enrolement).filter(Enrolement.customer_id == customer_id).first():
            raise HTTPException(status_code=400, detail="Customer already enrolled") 

        # 2. Validate integer fields
        for name in ("user_id", "ic_company_id", "branch_id", "product_id"):
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
        # Check for duplicate receipt_no
        if self.db.query(Enrolement).filter(Enrolement.receipt_no == enrolement.receipt_no).first():
            raise HTTPException(status_code=400, detail="Duplicate receipt_no is not allowed")
        # Create new instance from received data
        db_enrolement = Enrolement(
            customer_id = customer_id,
            cps_zone  = enrolement.cps_zone,
            grid     = enrolement.grid,
            latitude = enrolement.latitude,
            longitude = enrolement.longitude,
            user_id      = enrolement.user_id,
            ic_company_id= enrolement.ic_company_id,
            branch_id    = enrolement.branch_id,
            premium      = enrolement.premium,
            sum_insured  = enrolement.sum_insured,
            date_from    = enrolement.date_from,
            date_to      = enrolement.date_to,
            receipt_no   = enrolement.receipt_no,
            product_id   = enrolement.product_id,
            status       = "pending",
            createdAt    = datetime.utcnow()
        )


        
        
        self.db.add(db_enrolement)
        self.db.commit()
        self.db.refresh(db_enrolement)
        

        return {
            "enrolement_id": db_enrolement.enrolment_id,
            "createdAt": db_enrolement.createdAt,
        }

        

    def get_enrolement(self, enrolement_id: int):
        return self.db.query(Enrolement).filter(Enrolement.enrolment_id == enrolement_id).first()

    def get_enrolements_by_company_id(self, company_id: int):
        return self.db.query(Enrolement).filter(Enrolement.ic_company_id == company_id).all()

    def get_enrolements_by_user_id(self, user_id: int):
        return self.db.query(Enrolement).filter(Enrolement.user_id == user_id).all()

    def get_enrolements(self):
        return self.db.query(Enrolement).all()

    def approve_enrolement(self, enrolement_id: int):
        db_enroll = self.db.query(Enrolement).filter(Enrolement.enrolment_id == enrolement_id).first()
        if not db_enroll:
            raise HTTPException(status_code=404, detail="Enrolement not found")
        if db_enroll.status == "approved":
            raise HTTPException(status_code=400, detail="Enrolement is already approved")
        db_enroll.status = "approved"

        self.db.commit()
        self.db.refresh(db_enroll)
        return db_enroll
    def reject_enrolement(self, enrolement_id: int):
        db_enroll = self.db.query(Enrolement).filter(Enrolement.enrolment_id == enrolement_id).first()
        if not db_enroll:
            raise HTTPException(status_code=404, detail=f"Enrolement with {enrolement_id} not found")
        
        
        db_enroll.status = "rejected"

        self.db.commit()
        self.db.refresh(db_enroll)
        return db_enroll