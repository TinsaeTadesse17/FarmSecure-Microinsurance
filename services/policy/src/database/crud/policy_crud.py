# policy/src/database/crud/policy_crud.py
from sqlalchemy.orm import Session
from httpx import AsyncClient, HTTPError
from src.database.models.policy import Policy, PolicyStatus
from src.schemas.policy_schema import PolicyCreate
from src.core.config import settings

class PolicyService:
    def __init__(self, db: Session):
        self.db = db

    async def _fetch_product(self, product_id: int):
        url = f"{settings.PRODUCT_SERVICE_URL}{settings.API_V1_STR}/products/{product_id}"
        async with AsyncClient() as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()

    async def create_policy(self, policy_in: PolicyCreate):
        # Validate customer via DFS (optional)
        # dfs_url = f"{settings.DFS_SERVICE_URL}/enrollments/{policy_in.customer_id}"
        # ... fetch/validate ...

        product = await self._fetch_product(policy_in.product_id)
        print("policy_in")
        print(policy_in)
        print("product")
        print(product)
        ptype = product["type"]
        periods = []

        if ptype == "crop":
            n = int(product["period"])
            amt = int(policy_in.sum_insured )/ n
            periods = [{"period": str(i+1), "amount": amt} for i in range(n)]

        elif ptype == "livestock":
            # 58% LRLD (4 months), 42% SRSD (3 months)
            lrld = policy_in.sum_insured * 0.58
            srsd = policy_in.sum_insured * 0.42
            per_lrld = lrld / 4
            per_srsd = srsd / 3
            periods = [{"period": f"LRLD-{i+1}", "amount": per_lrld} for i in range(4)]
            periods += [{"period": f"SRSD-{i+1}", "amount": per_srsd} for i in range(3)]

        db_obj = Policy(
            customer_id=policy_in.customer_id,
            product_id=policy_in.product_id,
            policy_id=policy_in.policy_id,
            sum_insured=policy_in.sum_insured,
            periods=periods,
            status=PolicyStatus.pending
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_policy(self, policy_id: int):
        return self.db.query(Policy).filter(Policy.id == policy_id).first()

    def approve_policy(self, policy_id: int):
        pol = self.get_policy(policy_id)
        if not pol:
            return None
        pol.status = PolicyStatus.approved
        self.db.commit()
        self.db.refresh(pol)
        return pol
