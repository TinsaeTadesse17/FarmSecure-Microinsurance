from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.db import get_db
from src.database.models.user import User
from src.schemas import user as user_schema, auth as auth_schema
from src.database.core.security import hash_password
from src.database.core.auth import login_user
import secrets
import string

router = APIRouter(prefix="/api/user", tags=["user"])

def generate_username():
    return "user_" + secrets.token_hex(4)  

def generate_password(length=10):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

@router.post("/", response_model=dict)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    if user.role != "admin" and not user.company_id:
        raise HTTPException(status_code=400, detail="Non-admin users must have a company_id")

    generated_username = generate_username()
    generated_password = generate_password()
    hashed_pw = hash_password(generated_password)

    db_user = User(
        username=generated_username,
        password=hashed_pw,
        role=user.role,
        company_id=user.company_id if user.role != "admin" else None,
        status="pending" if user.role != "admin" else None,
        must_change_password=True
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "username": generated_username,
        "password": generated_password,           
        "company_id": db_user.company_id          
    }

@router.post("/login", response_model=auth_schema.TokenResponse)
def login(credentials: auth_schema.LoginRequest, db: Session = Depends(get_db)):
    token = login_user(db, credentials.username, credentials.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token}

user_router = router
