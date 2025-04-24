from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from src.database.crud.report_crud import ReportService
from src.utils.report_generator import generate_pdf, generate_csv
import asyncio
from io import BytesIO

router = APIRouter()

@router.get("/{kind}", summary="Generate a report")
async def get_report(
    kind: str,
    format: str = Query("pdf", regex="^(pdf|csv)$")
):
    service = ReportService()
    try:
        report = await service.get_report(kind)
    except ValueError:
        raise HTTPException(404, "Report kind not found")
    if format == "pdf":
        content = generate_pdf(report)
        return StreamingResponse(BytesIO(content), media_type="application/pdf",
                                 headers={"Content-Disposition": f"attachment; filename={kind}.pdf"})
    else:
        content = generate_csv(report)
        return StreamingResponse(BytesIO(content), media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename={kind}.csv"})
