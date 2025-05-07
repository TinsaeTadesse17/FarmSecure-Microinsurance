'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';

interface Record {
  id: number;
  farmerName: string;
  policyName: string;
  amount: number;
  type: 'refund' | 'reenroll';
  status: 'pending' | 'completed';
}

export default function RefundReEnrollPage() {
  const [records, setRecords] = useState<Record[]>([
    {
      id: 1,
      farmerName: 'Amanuel T.',
      policyName: 'Crop Cover A',
      amount: 150,
      type: 'refund',
      status: 'pending',
    },
    {
      id: 2,
      farmerName: 'Selam A.',
      policyName: 'Crop Cover B',
      amount: 200,
      type: 'reenroll',
      status: 'pending',
    },
  ]);

  const handleAction = (id: number, action: 'refund' | 'reenroll') => {
    alert(`${action === 'refund' ? 'Refunded' : 'Re-enrolled'} record #${id}`);
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, status: 'completed' } : rec
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Refund / Re-Enrollment</h2>

          <table className="w-full text-left border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Farmer</th>
                <th className="px-4 py-2 border">Policy</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td className="px-4 py-2 border">{rec.farmerName}</td>
                  <td className="px-4 py-2 border">{rec.policyName}</td>
                  <td className="px-4 py-2 border">${rec.amount}</td>
                  <td className="px-4 py-2 border capitalize">{rec.type}</td>
                  <td className="px-4 py-2 border capitalize">{rec.status}</td>
                  <td className="px-4 py-2 border text-right">
                    {rec.status === 'pending' && (
                      <button
                        onClick={() => handleAction(rec.id, rec.type)}
                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                      >
                        {rec.type === 'refund' ? 'Process Refund' : 'Re-Enroll'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
