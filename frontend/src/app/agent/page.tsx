'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { Sprout, ClipboardList } from 'lucide-react';
import {
  listEnrollments,
  approveEnrollment,
  rejectEnrollment,
  EnrollmentResponse
} from '@/utils/api/enrollment';
import { getToken, getCurrentUser } from '@/utils/api/user';

const MapPicker = dynamic(() => import('@/components/agent/mapPicker'), { ssr: false });

export default function EnrollmentManagementPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    premium: '',
    sumInsured: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) throw new Error('Authentication token not found');

        const user = await getCurrentUser(token);
        const data = await listEnrollments();
        const filtered = data.filter(enr => enr.ic_company_id === user.company_id);
        setEnrollments(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approveEnrollment(id);
      setEnrollments(prev =>
        prev.map(enr =>
          enr.enrolement_id === id ? { ...enr, status: 'approved' } : enr
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve enrollment');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectEnrollment(id);
      setEnrollments(prev =>
        prev.map(enr =>
          enr.enrolement_id === id ? { ...enr, status: 'rejected' } : enr
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject enrollment');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can submit the formData and location here to the backend
    alert(`Form submitted with location: ${location?.lat}, ${location?.lng}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const statusStyles = {
    approved: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100/80 text-rose-800 border-rose-200',
    pending: 'bg-amber-100/80 text-amber-800 border-amber-200',
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-[#8ba77f]" />
              Enrollment Management
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Policy Approvals
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f]">Review and manage policy enrollments</p>
          </div>
          <AvatarMenu />
        </div>

        <div className="mb-10">
          <button
            className="mb-4 px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f]"
            onClick={() => setFormVisible(prev => !prev)}
          >
            {formVisible ? 'Hide Form' : 'Add Enrollment'}
          </button>

          {formVisible && (
            <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg border mb-6 space-y-4">
              <input
                name="customerId"
                type="text"
                placeholder="Customer ID"
                value={formData.customerId}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <input
                name="premium"
                type="number"
                placeholder="Premium"
                value={formData.premium}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <input
                name="sumInsured"
                type="number"
                placeholder="Sum Insured"
                value={formData.sumInsured}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <input
                name="dateFrom"
                type="date"
                value={formData.dateFrom}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <input
                name="dateTo"
                type="date"
                value={formData.dateTo}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <MapPicker
                onChange={(lat, lng) => setLocation({ lat, lng })}
                defaultPosition={[9.03, 38.74]}
              />
              {location && (
                <p className="text-sm text-[#7a938f]">
                  Selected: Latitude {location.lat}, Longitude {location.lng}
                </p>
              )}
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-[#8ba77f] text-white rounded hover:bg-[#7a937f]"
              >
                Submit Enrollment
              </button>
            </form>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8ba77f]" />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-rose-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
              <div className="overflow-hidden border border-[#e0e7d4] rounded-xl">
                <table className="min-w-full divide-y divide-[#e0e7d4]">
                  <thead className="bg-[#f9f8f3]">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-[#3a584e] text-left">Customer</th>
                      <th className="px-6 py-4 text-sm font-semibold text-[#3a584e] text-left">Premium</th>
                      <th className="px-6 py-4 text-sm font-semibold text-[#3a584e] text-left">Coverage</th>
                      <th className="px-6 py-4 text-sm font-semibold text-[#3a584e] text-left">Period</th>
                      <th className="px-6 py-4 text-sm font-semibold text-[#3a584e] text-left">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-[#3a584e] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#e0e7d4]">
                    {enrollments.map(enrollment => (
                      <tr key={enrollment.enrolement_id} className="hover:bg-[#f9f8f3] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#3a584e]">
                            {enrollment.customer?.f_name} {enrollment.customer?.m_name ?? ''} {enrollment.customer?.l_name}
                          </div>
                          <div className="text-xs text-[#7a938f]">ID: {enrollment.customer_id}</div>
                        </td>
                        <td className="px-6 py-4 text-[#3a584e]">
                          ${enrollment.premium.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-[#3a584e]">
                          ${enrollment.sum_insured.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-[#3a584e]">
                          {formatDate(enrollment.date_from)} – {formatDate(enrollment.date_to)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm rounded-full border ${statusStyles[enrollment.status.toLowerCase() as keyof typeof statusStyles]}`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {enrollment.status.toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(enrollment.enrolement_id)}
                                className="px-3 py-1.5 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] text-sm font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(enrollment.enrolement_id)}
                                className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 text-sm font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {enrollments.length === 0 && (
                <div className="text-center py-12 bg-[#f9f8f3] rounded-lg border-2 border-dashed border-[#e0e7d4]">
                  <Sprout className="mx-auto h-12 w-12 text-[#7a938f]" />
                  <h3 className="mt-4 text-lg font-medium text-[#3a584e]">No pending enrollments</h3>
                  <p className="mt-2 text-sm text-[#7a938f]">All enrollment requests are processed</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
