from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.db import get_db
from src.database.models.user import User
from src.schemas import auth as auth_schema
from src.schemas import user as user_schema
from src.database.core.security import hash_password
from src.database.core.auth import login_user

router = APIRouter(prefix="/api/user", tags=["user"])

@router.post("/", response_model=user_schema.UserOut)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password)
    db_user = User(
        username=user.username,
        password=hashed_pw,
        status=user.status,
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=auth_schema.TokenResponse)
def login(credentials: auth_schema.LoginRequest, db: Session = Depends(get_db)):
    token = login_user(db, credentials.username, credentials.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token}

user_router = router
