'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { 
  listEnrollments, 
  approveEnrollment, 
  rejectEnrollment,
  EnrollmentResponse 
} from '@/utils/api/enrollment';

export default function EnrollmentManagementPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await listEnrollments();
        setEnrollments(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approveEnrollment(id);
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.enrolement_id === id 
            ? { ...enrollment, status: 'approved' } 
            : enrollment
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
        prev.map(enrollment => 
          enrollment.enrolement_id === id 
            ? { ...enrollment, status: 'rejected' } 
            : enrollment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject enrollment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white text-black">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-end mb-6">
            <AvatarMenu />
          </div>
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-white text-black">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-end mb-6">
            <AvatarMenu />
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Enrollment Management</h1>
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-green-800">Enrollment ID</th>
                  <th className="px-6 py-3 font-semibold text-green-800">Customer ID</th>
                  <th className="px-6 py-3 font-semibold text-green-800">Premium</th>
                  <th className="px-6 py-3 font-semibold text-green-800">Sum Insured</th>
                  <th className="px-6 py-3 font-semibold text-green-800">Period</th>
                  <th className="px-6 py-3 font-semibold text-green-800">Status</th>
                  <th className="px-6 py-3 font-semibold text-green-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.enrolement_id} className="hover:bg-green-50">
                    <td className="px-6 py-4">{enrollment.enrolement_id}</td>
                    <td className="px-6 py-4">{enrollment.customer_id}</td>
                    <td className="px-6 py-4">${enrollment.premium.toFixed(2)}</td>
                    <td className="px-6 py-4">${enrollment.sum_insured.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {formatDate(enrollment.date_from)} - {formatDate(enrollment.date_to)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {enrollment.status.toLowerCase() === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(enrollment.enrolement_id)}
                            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(enrollment.enrolement_id)}
                            className="px-3 py-1 rounded bg-white text-green-600 border border-green-600 hover:bg-green-50 text-sm font-medium"
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
            <div className="text-center py-8 text-green-800">
              <p>No enrollments found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}