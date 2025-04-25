from sqlalchemy.orm import Session
from src.database.models.user import User
from src.database.core.security import hash_password
from src.database.core.config import settings  
import os

def seed_admin_user(db: Session):
    # Check if any admin already exists
    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        print(" Admin user already exists.")
        return

    admin_user = User(
        username=settings.ADMIN_USERNAME,
        password=hash_password(settings.ADMIN_PASSWORD),
        role="admin",
        status=None,           
        company_id=None 
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print(f" Admin user created: {admin_user.username}")
