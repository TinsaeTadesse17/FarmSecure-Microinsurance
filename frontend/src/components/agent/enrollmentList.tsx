'use client';

import React, { useEffect, useState } from 'react';
import { approveEnrollment, rejectEnrollment, listEnrollments } from '@/utils/api/enrollment';

interface Enrollment {
  enrolement_id: number;
  customer_id: number;
  cps_zone: string;
  premium: number;
  sum_insured: number;
  date_from: string;
  date_to: string;
  status: string;
}

export default function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await listEnrollments();
        const pending = data.filter((e: Enrollment) => e.status === 'pending');
        setEnrollments(pending);
      } catch (err: any) {
        setError(err.message || 'Failed to load enrollments');
      }
    }

    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approveEnrollment(id);
      setEnrollments((prev) => prev.filter((e) => e.enrolement_id !== id));
    } catch (err: any) {
      alert('Failed to approve enrollment: ' + err.message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectEnrollment(id);
      setEnrollments((prev) => prev.filter((e) => e.enrolement_id !== id));
    } catch (err: any) {
      alert('Failed to reject enrollment: ' + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4 text-black">Pending Enrollments</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Customer ID</th>
            <th className="p-2 border">CPS Zone</th>
            <th className="p-2 border">Premium</th>
            <th className="p-2 border">Sum Insured</th>
            <th className="p-2 border">From</th>
            <th className="p-2 border">To</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr key={e.enrolement_id}>
              <td className="p-2 border">{e.customer_id}</td>
              <td className="p-2 border">{e.cps_zone}</td>
              <td className="p-2 border">{e.premium}</td>
              <td className="p-2 border">{e.sum_insured}</td>
              <td className="p-2 border">{e.date_from.slice(0, 10)}</td>
              <td className="p-2 border">{e.date_to.slice(0, 10)}</td>
              <td className="p-2 border space-x-2">
                <button onClick={() => handleApprove(e.enrolement_id)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Approve
                </button>
                <button onClick={() => handleReject(e.enrolement_id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
