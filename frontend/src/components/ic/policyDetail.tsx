'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getPolicy } from '@/utils/api/policy';
import { getEnrollment } from '@/utils/api/enrollment';
import { X, Printer, User, BadgeInfo, CalendarDays, Wallet } from 'lucide-react';

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

  // Keep existing useEffect and data fetching logic unchanged

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
        <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-[#8ba77f] border-t-transparent rounded-full"></div>
          <span className="text-[#5a736e]">Growing policy details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.25)] border border-[#e0e7d4]">
        {/* Header */}
        <div className="bg-[#f5f3eb] px-6 py-4 border-b border-[#e0e7d4] flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#3a584e] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#8ba77f]" />
            Policy Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#8ba77f] hover:bg-[#7a937f] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Export/Print
            </button>
            <button
              onClick={onClose}
              className="text-[#7a938f] hover:text-[#5a736e] p-2 rounded-full hover:bg-[#eef4e5] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[80vh]" ref={contentRef}>
          {/* Customer Info Section */}
          <div className="mb-6 bg-[#f9f8f3] rounded-xl p-5 border border-[#e0e7d4]">
            <h3 className="text-lg font-semibold text-[#3a584e] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#7a938f]" />
              Customer Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-[#7a938f] font-medium">Full Name</p>
                <p className="text-[#3a584e]">
                  {enrollment.customer.f_name} {enrollment.customer.m_name} {enrollment.customer.l_name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[#7a938f] font-medium flex items-center gap-2">
                  <BadgeInfo className="w-4 h-4" />
                  Account Details
                </p>
                <p className="text-[#3a584e]">
                  {enrollment.customer.account_no} ({enrollment.customer.account_type})
                </p>
              </div>
            </div>
          </div>

          {/* Policy Periods Section */}
          <div className="border border-[#e0e7d4] rounded-xl overflow-hidden">
            <h3 className="text-lg font-semibold text-[#3a584e] bg-[#f5f3eb] px-5 py-3 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#7a938f]" />
              Policy Timeline
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-[#f9f8f3]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#7a938f] font-medium">Period</th>
                  <th className="px-4 py-3 text-left text-[#7a938f] font-medium">Sum Insured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e7d4]">
                {policy.details.map((item: any) => (
                  <tr key={item.period} className="hover:bg-[#f9f8f3] transition-colors">
                    <td className="px-4 py-3 text-[#3a584e]">{item.period}</td>
                    <td className="px-4 py-3 text-[#3a584e] font-medium">
                      ETB {parseFloat(item.period_sum_insured).toLocaleString()}
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