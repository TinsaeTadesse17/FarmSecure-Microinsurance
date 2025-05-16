'use client';
import React, { useEffect, useState } from 'react';
import { listEnrollments, EnrollmentResponse } from '@/utils/api/enrollment';
import { RefreshCw, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await listEnrollments();
        setEnrollments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load enrollments');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { color: 'bg-[#eef4e5] text-[#3a584e]', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'rejected':
        return { color: 'bg-[#fee2e2] text-[#dc2626]', icon: <XCircle className="w-4 h-4" /> };
      case 'pending':
      default:
        return { color: 'bg-[#fff3e5] text-[#d46a1a]', icon: <Clock className="w-4 h-4" /> };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-[#e0e7d4]">
        <h2 className="text-xl font-semibold text-[#3a584e] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#8ba77f]" />
          Policy Enrollments
        </h2>
        {enrollments.length > 0 && (
          <span className="px-3 py-1 bg-[#eef4e5] text-[#3a584e] text-sm font-medium rounded-full">
            {enrollments.length} total
          </span>
        )}
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
            <p className="mt-2">No policy enrollments found in the system</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e0e7d4]">
              <thead className="bg-[#f9f8f3]">
                <tr>
                  {['Customer', 'Zone', 'Premium', 'Coverage', 'Period', 'Status'].map((header) => (
                    <th 
                      key={header}
                      className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e7d4]">
                {enrollments.map((e) => {
                  const statusConfig = getStatusConfig(e.status);
                  return (
                    <tr 
                      key={e.enrolement_id} 
                      className="hover:bg-[#f9f8f3] transition-colors cursor-pointer"
                    >
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
                        <span className="px-2.5 py-1 text-xs font-medium bg-[#eef4e5] text-[#3a584e] rounded-full">
                          Active
                        </span>
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