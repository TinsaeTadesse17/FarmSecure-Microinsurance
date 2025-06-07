from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from src.database.db import Base

class Policy(Base):
    __tablename__ = 'policy'
    policy_id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    ic_company_id = Column(Integer, nullable=False)
    policy_no = Column(String(50), nullable=False, unique=True)
    fiscal_year = Column(String(4), nullable=False)
    status = Column(String(20), nullable=False, default='pending')

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected')", name='ck_policy_status'),
    )

    details = relationship(
        'PolicyDetail', back_populates='policy', cascade='all, delete-orphan'
    )

class PolicyDetail(Base):
    __tablename__ = 'policy_detail'
    policy_detail_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer,  nullable=False)
    policy_id = Column(Integer, ForeignKey('policy.policy_id'), nullable=False)
    period = Column(Integer, nullable=False)
    period_sum_insured = Column(Numeric(14, 2), nullable=False)

    policy = relationship('Policy', back_populates='details')