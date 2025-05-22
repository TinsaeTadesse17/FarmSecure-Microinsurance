# src/routes/enrolement_routes.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.database.crud.enrolement_crud import EnrolementService
from src.database.crud.customer_crud import CustomerService
from src.schemas.enrolement_schema import EnrolementRequest, EnrolementResponse, CustomerResponse
from src.database.db import get_db
from src.schemas.customer_schema import CustomerRequest
from src.core.config import settings
from src.utils.grid_and_zone_getter import GridAndZoneGetter
import httpx
from src.database.models.customer import Customer

POLICY_SERVICE_URL = settings.POLICY_SERVICE_URL + '/api'

router = APIRouter()

@router.post("/", response_model=EnrolementResponse, status_code=201)
def create_enrolement(
    enrolement: EnrolementRequest,
    db: Session = Depends(get_db),
):
    service = EnrolementService(db)
    customer_service = CustomerService(db)
    try:
        customer = CustomerRequest(
            f_name=enrolement.f_name,
            m_name=enrolement.m_name,
            l_name=enrolement.l_name,
            account_no=enrolement.account_no,
            account_type=enrolement.account_type,
        )
        customer_id = customer_service.create_customer(customer)
        grid_zone_getter = GridAndZoneGetter()

        grid , cps_zone = grid_zone_getter.get_grid_and_zone_inference_filtered(enrolement.lattitude,  enrolement.longitude)
        enrolement.cps_zone = cps_zone
        enrolement.grid = grid
    except HTTPException as e:
        if e.status_code == 400:
            raise HTTPException(status_code=400, detail="Customer already enrolled")
        else:
            raise HTTPException(status_code=500, detail="Internal server error")
    
    enroll_json = service.create_enrolement(enrolement, customer_id)
    enroll_id = enroll_json["enrolement_id"]
    createdAt = enroll_json["createdAt"]
    enroll = EnrolementResponse(
        enrolement_id=enroll_id,
        customer_id=customer_id,
        customer=CustomerResponse(
            f_name=enrolement.f_name,
            m_name=enrolement.m_name,
            l_name=enrolement.l_name,
            account_no=enrolement.account_no,
            account_type=enrolement.account_type,
        ),
        createdAt=createdAt,
        user_id=enrolement.user_id,
        status="pending",
        ic_company_id=enrolement.ic_company_id,
        branch_id=enrolement.branch_id,
        premium=enrolement.premium,
        sum_insured=enrolement.sum_insured,
        date_from=enrolement.date_from,
        date_to=enrolement.date_to,
        receipt_no=enrolement.receipt_no,
        product_id=enrolement.product_id,
        cps_zone=enrolement.cps_zone
    )
    return enroll

@router.get("/{enrollment_id}", response_model=EnrolementResponse)
def read_enrolement(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    db_enr = service.get_enrolement(enrollment_id)
    if not db_enr:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db_customer = db.query(Customer).filter(Customer.customer_id == db_enr.customer_id).first()
    result = EnrolementResponse(
        enrolement_id=db_enr.enrolment_id,
        customer_id=db_enr.customer_id,
        customer=CustomerResponse(
            f_name=db_customer.f_name,
            m_name=db_customer.m_name,
            l_name=db_customer.l_name,
            account_no=db_customer.account_no,
            account_type=db_customer.account_type,
        ),
        createdAt=db_enr.createdAt,
        user_id=db_enr.user_id,
        status=db_enr.status,
        ic_company_id=db_enr.ic_company_id,
        branch_id=db_enr.branch_id,
        premium=db_enr.premium,
        sum_insured=db_enr.sum_insured,
        date_from=db_enr.date_from,
        date_to=db_enr.date_to,
        receipt_no=db_enr.receipt_no,
        product_id=db_enr.product_id,
        cps_zone=db_enr.cps_zone
    )
    return result

@router.get("/", response_model=list[EnrolementResponse])
def list_enrolements(
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    enrollments =  service.get_enrolements()
    result = []
    for db_enr in enrollments:
        db_customer = db.query(Customer).filter(Customer.customer_id == db_enr.customer_id).first()
        enrol = EnrolementResponse(
            enrolement_id=db_enr.enrolment_id,
            customer_id=db_enr.customer_id,
            customer=CustomerResponse(
                f_name=db_customer.f_name,
                m_name=db_customer.m_name,
                l_name=db_customer.l_name,
                account_no=db_customer.account_no,
                account_type=db_customer.account_type,
            ),
            createdAt=db_enr.createdAt,
            user_id=db_enr.user_id,
            status=db_enr.status,
            ic_company_id=db_enr.ic_company_id,
            branch_id=db_enr.branch_id,
            premium=db_enr.premium,
            sum_insured=db_enr.sum_insured,
            date_from=db_enr.date_from,
            date_to=db_enr.date_to,
            receipt_no=db_enr.receipt_no,
            product_id=db_enr.product_id,
            cps_zone=db_enr.cps_zone
        )
        result.append(enrol)
    return result

@router.put("/{enrollment_id}/approve")
def approve_enrolement(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    try:
        result = service.approve_enrolement(enrollment_id)
    except HTTPException as e:
        raise e

    if result:
        url = f"{POLICY_SERVICE_URL}/policy"
        payload = {
            "enrollment_id": enrollment_id,
        }
        try:
            response = httpx.post(url, json=payload)
            response.raise_for_status()
            return {
                "sucess": True,
                "message": f"Enrollment for {enrollment_id} approved and policy created successfully",
            }
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Policy service request failed: {e}")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=response.status_code, detail=f"Policy service error: {e}")

@router.put("/{enrollment_id}/reject")
def reject_enrolement(
    enrollment_id: int,
    db: Session = Depends(get_db)
):
    service = EnrolementService(db)
    try:
        return service.reject_enrolement(enrollment_id)
    except HTTPException as e:
        raise e