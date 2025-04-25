from datetime import datetime
from pydantic import BaseModel

class ReportRow(BaseModel):
    date: datetime
    total: float

class ReportResponse(BaseModel):
    title: str
    generated_at: datetime
    rows: list[ReportRow]
    grand_total: float
