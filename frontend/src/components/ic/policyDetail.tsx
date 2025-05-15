// components/ic/PolicyDetailModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getPolicy } from '@/utils/api/policy';
import { getEnrollment } from '@/utils/api/enrollment';

interface Props {
  policyId: number;
  onClose: () => void;
}

const PolicyDetailModal: React.FC<Props> = ({ policyId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const policyData = await getPolicy(policyId);
        setPolicy(policyData);
        const enrollmentData = await getEnrollment(policyData.enrollment_id);
        setEnrollment(enrollmentData);
      } catch (err) {
        console.error('Error loading policy details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [policyId]);

  const handlePrint = () => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Policy Detail</title>');
    printWindow.document.write('<style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:12px;text-align:left;} th{background:#f8f8f8;} .print-section{margin-bottom:20px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(contentRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
          <span className="text-gray-700">Loading policy details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Policy Details</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export/Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[80vh]" ref={contentRef}>
          {/* Customer Info Section */}
          <div className="mb-6 bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-600 font-medium">Full Name</p>
                <p className="text-gray-900">{enrollment.customer.f_name} {enrollment.customer.m_name} {enrollment.customer.l_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 font-medium">Account Details</p>
                <p className="text-gray-900">{enrollment.customer.account_no} ({enrollment.customer.account_type})</p>
              </div>
            </div>
          </div>

          {/* Policy Periods Section */}
          <div className="border rounded-xl overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 bg-gray-50 px-5 py-3">Policy Periods</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Period</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Sum Insured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {policy.details.map((item: any) => (
                  <tr key={item.period} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">{item.period}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      ${parseFloat(item.period_sum_insured).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailModal;