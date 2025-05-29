import jsPDF from 'jspdf';
import { EnrollmentResponse } from '@/utils/api/enrollment';

export function generateEnrollmentPDF(enrollment: EnrollmentResponse) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(40, 60, 100);
  doc.text('AGRICULTURAL INSURANCE - ENROLLMENT SUMMARY', 20, 20);
  doc.line(20, 23, 190, 23);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Customer Information', 20, 35);
  doc.rect(18, 38, 174, 40);

  doc.text(`Full Name: ${enrollment.customer.f_name} ${enrollment.customer.m_name} ${enrollment.customer.l_name}`, 22, 45);
  doc.text(`Account No: ${enrollment.customer.account_no}`, 22, 52);
  doc.text(`Account Type: ${enrollment.customer.account_type}`, 110, 52);

  doc.text('Enrollment Details', 20, 85);
  doc.rect(18, 88, 174, 60);
  doc.text(`Enrollment ID: ${enrollment.enrolement_id}`, 22, 95);
  doc.text(`Status: ${enrollment.status}`, 110, 95);
  doc.text(`Premium: $${enrollment.premium}`, 22, 102);
  doc.text(`Sum Insured: $${enrollment.sum_insured}`, 110, 102);
  doc.text(`Coverage Period: ${enrollment.date_from} to ${enrollment.date_to}`, 22, 109);
  doc.text(`CPS Zone: ${enrollment.cps_zone}`, 22, 116);
  doc.text(`Coordinates: (${enrollment.longtiude}, ${enrollment.latitude})`, 110, 116);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280);

  doc.save(`Enrollment_${enrollment.enrolement_id}.pdf`);
}
