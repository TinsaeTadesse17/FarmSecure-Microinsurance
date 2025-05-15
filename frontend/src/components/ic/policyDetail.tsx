// components/ic/PolicyDetailModal.tsx
import React, { useEffect, useState } from 'react';
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-transparent backdrop-blur flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0  bg-transparent backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full rounded-lg shadow-lg p-6 overflow-auto max-h-[90vh] text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Policy Details</h2>
          <button onClick={onClose} className="text-black hover:text-red-500 text-lg font-bold">&times;</button>
        </div>

        {/* Customer Info */}
        <div className="mb-4 space-y-1 text-sm">
          <h3 className="font-medium">Customer Info</h3>
          <p><span className="font-medium">Name:</span> {enrollment.customer.f_name} {enrollment.customer.m_name} {enrollment.customer.l_name}</p>
          <p><span className="font-medium">Account:</span> {enrollment.customer.account_no} ({enrollment.customer.account_type})</p>
        </div>

        {/* Policy Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Policy Periods</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {policy.details.map((item: any) => (
              <div key={item.period} className="border p-2 rounded bg-gray-50">
                <p><span className="font-medium">Period:</span> {item.period}</p>
                <p><span className="font-medium">Sum Insured:</span> {item.period_sum_insured}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailModal;