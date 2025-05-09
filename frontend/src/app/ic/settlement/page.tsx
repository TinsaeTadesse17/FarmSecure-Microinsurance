'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';

export default function ViewSettlementStatusPage() {
  const mockSettlements = [
    {
      id: 1,
      policyHolder: 'John Doe',
      amount: 1200,
      status: 'Paid',
      date: '2025-05-01',
    },
    {
      id: 2,
      policyHolder: 'Jane Smith',
      amount: 950,
      status: 'Pending',
      date: '2025-05-03',
    },
    {
      id: 3,
      policyHolder: 'Ali Beko',
      amount: 1340,
      status: 'Paid',
      date: '2025-05-04',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">View Settlement Status</h2>

          <table className="w-full text-left border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Policy Holder</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockSettlements.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border">{item.id}</td>
                  <td className="px-4 py-2 border">{item.policyHolder}</td>
                  <td className="px-4 py-2 border">${item.amount}</td>
                  <td className="px-4 py-2 border">{item.status}</td>
                  <td className="px-4 py-2 border">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
