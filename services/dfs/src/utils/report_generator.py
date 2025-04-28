# Generates PDF and CSV from ReportResponse data

from io import BytesIO, StringIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import csv

def generate_pdf(report: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elems = []
    styles = getSampleStyleSheet()
    elems.append(Paragraph(report["title"], styles["Title"]))
    data = [["Date", "Total"]]
    for row in report["rows"]:
        data.append([row["date"].strftime("%Y-%m-%d"), f"{row['total']:.2f}"])
    data.append(["Grand Total", f"{report['grand_total']:.2f}"])
    tbl = Table(data)
    tbl.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
    ]))
    elems.append(tbl)
    doc.build(elems)
    return buffer.getvalue()

def generate_csv(report: dict) -> bytes:
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([report["title"]])
    writer.writerow(["Date", "Total"])
    for row in report["rows"]:
        writer.writerow([row["date"].strftime("%Y-%m-%d"), f"{row['total']:.2f}"])
    writer.writerow([])
    writer.writerow(["Grand Total", f"{report['grand_total']:.2f}"])
    return output.getvalue().encode()
