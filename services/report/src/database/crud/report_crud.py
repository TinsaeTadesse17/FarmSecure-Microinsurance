from httpx import AsyncClient
from src.core.config import settings
from datetime import datetime

class ReportService:
    def __init__(self):
        self.client = AsyncClient()
    
    async def _fetch(self, url: str):
        resp = await self.client.get(url)
        resp.raise_for_status()
        return resp.json()
    
    async def _aggregate(self, data: list[dict], key_date: str, key_value: str):
        # group by date
        agg = {}
        for item in data:
            d = datetime.fromisoformat(item[key_date]).date()
            agg[d] = agg.get(d, 0) + float(item[key_value])
        rows = [{"date": d, "total": total} for d, total in sorted(agg.items())]
        grand = sum(r["total"] for r in rows)
        return rows, grand
        
    async def get_report(self, kind: str):
        if kind == "sales":
            data = await self._fetch(f"{settings.POLICY_SERVICE_URL}{settings.API_V1_STR}/policies")
            rows, grand = await self._aggregate(data, "created_at", "sum_insured")
            title = "Sales Report"
        elif kind == "claims":
            data = await self._fetch(f"{settings.CLAIM_SERVICE_URL}{settings.API_V1_STR}/claims")
            rows, grand = await self._aggregate(data, "calculated_at", "claim_amount")
            title = "Claims Report"
        elif kind == "commissions":
            data = await self._fetch(f"{settings.COMMISSION_SERVICE_URL}{settings.API_V1_STR}/commissions")
            rows, grand = await self._aggregate(data, "period", "net_commission")
            title = "Commission Report"
        else:
            raise ValueError("Unknown report kind")
        return {"title": title, "generated_at": datetime.utcnow(), "rows": rows, "grand_total": grand}
