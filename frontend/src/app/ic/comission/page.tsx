'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';

export default function CommissionManagementPage() {
  const mockCommissions = [
    {
      id: 1,
      agentName: 'Alemu Tadesse',
      policySold: 10,
      totalCommission: 3000,
      status: 'Paid',
    },
    {
      id: 2,
      agentName: 'Sara Hailu',
      policySold: 7,
      totalCommission: 2100,
      status: 'Pending',
    },
    {
      id: 3,
      agentName: 'Michael Kebede',
      policySold: 5,
      totalCommission: 1500,
      status: 'Paid',
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
          <h2 className="text-xl font-bold mb-4">Commission Management</h2>

          <table className="w-full text-left border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Agent Name</th>
                <th className="px-4 py-2 border">Policies Sold</th>
                <th className="px-4 py-2 border">Total Commission</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockCommissions.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border">{item.id}</td>
                  <td className="px-4 py-2 border">{item.agentName}</td>
                  <td className="px-4 py-2 border">{item.policySold}</td>
                  <td className="px-4 py-2 border">${item.totalCommission}</td>
                  <td className="px-4 py-2 border">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
