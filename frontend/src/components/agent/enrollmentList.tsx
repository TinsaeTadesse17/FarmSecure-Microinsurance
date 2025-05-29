"use client";

import React, { useEffect, useState } from 'react';
import { getEnrollmentsByUser, EnrollmentResponse } from '@/utils/api/enrollment';
import { getToken, getCurrentUser } from '@/utils/api/user';
import { RefreshCw, FileText, CheckCircle2, XCircle, Clock, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';

export default function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [searchName, setSearchName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          setError('No token found. Please log in.');
          setIsLoading(false);
          return;
        }

        const user = await getCurrentUser();
        const data = await getEnrollmentsByUser(Number(user.sub));
        if (Array.isArray(data) && data.length === 0) {
          setError('No enrollments found for this user.');
        }

        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load enrollments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchName) return;
    const filtered = enrollments.filter(e => {
      const fullName = `${e.customer.f_name} ${e.customer.l_name}`.toLowerCase();
      return fullName.includes(searchName.toLowerCase());
    });
    setEnrollments(filtered);
  };

  const downloadPdf = (enrollment: EnrollmentResponse) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Enrollment ID: ${enrollment.enrolement_id}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Customer: ${enrollment.customer.f_name} ${enrollment.customer.m_name} ${enrollment.customer.l_name}`, 10, 20);
    doc.text(`Account No: ${enrollment.customer.account_no} (${enrollment.customer.account_type})`, 10, 30);
    doc.text(`Status: ${enrollment.status}`, 10, 40);
    doc.text(`Sum Insured: ${enrollment.sum_insured}`, 10, 50);
    doc.text(`Premium: ${enrollment.premium}`, 10, 60);
    doc.text(`Coverage Period: ${enrollment.date_from} to ${enrollment.date_to}`, 10, 70);
    doc.text(`Zone: ${enrollment.cps_zone}`, 10, 80);
    doc.text(`Location: (${enrollment.latitude}, ${enrollment.longtiude})`, 10, 90);
    doc.save(`enrollment_${enrollment.enrolement_id}.pdf`);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return { color: 'bg-[#eef4e5] text-[#3a584e]', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'rejected': return { color: 'bg-[#fee2e2] text-[#dc2626]', icon: <XCircle className="w-4 h-4" /> };
      case 'pending':
      default: return { color: 'bg-[#fff3e5] text-[#d46a1a]', icon: <Clock className="w-4 h-4" /> };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-[#e0e7d4]">
        <h2 className="text-xl font-semibold text-[#3a584e] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#8ba77f]" />
          Policy Enrollments
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name"
            className="border rounded px-3 py-1 text-sm"
          />
          <button
            onClick={handleSearch}
            className="flex items-center gap-1 px-3 py-1 bg-[#eef4e5] text-[#3a584e] rounded text-sm"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-[#fee2e2] border-l-4 border-[#dc2626] rounded text-sm text-[#7a938f] flex items-center gap-2">
            <XCircle className="w-5 h-5 text-[#dc2626]" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40 text-[#8ba77f]">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-8 text-[#7a938f]">
            <FileText className="mx-auto h-12 w-12 text-current mb-4" />
            <h3 className="text-lg font-medium">No active enrollments</h3>
            <p className="mt-2">No policy enrollments found for your account</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e0e7d4]">
              <thead className="bg-[#f9f8f3]">
                <tr>
                  {['Customer', 'Zone', 'Premium', 'Coverage', 'Period', 'Status', 'Action'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e7d4]">
                {enrollments.map((e) => {
                  const statusConfig = getStatusConfig(e.status);
                  return (
                    <tr key={e.enrolement_id} className="hover:bg-[#f9f8f3] transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#3a584e]">
                          {e.customer.f_name} {e.customer.l_name}
                        </div>
                        <div className="text-xs text-[#7a938f]">ID: {e.customer_id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#7a938f]">{e.cps_zone}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#3a584e]">{formatCurrency(e.premium)}</div>
                        <div className="text-xs text-[#7a938f]">{formatCurrency(e.sum_insured)} insured</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-[#eef4e5] text-[#3a584e] rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#7a938f]">
                        <div>{formatDate(e.date_from)}</div>
                        <div className="text-xs">to {formatDate(e.date_to)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusConfig.color} gap-2`}>
                          {statusConfig.icon}
                          {e.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => downloadPdf(e)}
                          className="inline-flex items-center gap-1 text-sm text-[#8ba77f] hover:text-[#3a584e]"
                        >
                          <Download className="w-4 h-4" /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
