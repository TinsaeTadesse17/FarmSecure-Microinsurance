'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreatePolicyDialog from '@/components/ic/policyDialog';

export default function PolicyManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const mockPolicies = [
    {
      id: 1,
      name: 'Basic Crop Cover',
      startDate: '2025-06-01',
      endDate: '2025-12-01',
      coverage: 1000,
      premium: 150,
    },
    {
      id: 2,
      name: 'Flood Risk Cover',
      startDate: '2025-07-01',
      endDate: '2026-01-01',
      coverage: 2000,
      premium: 250,
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Policy Management</h2>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Policy
            </button>
          </div>

          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Policy Name</th>
                <th className="px-4 py-2 border">Start Date</th>
                <th className="px-4 py-2 border">End Date</th>
                <th className="px-4 py-2 border">Coverage</th>
                <th className="px-4 py-2 border">Premium</th>
              </tr>
            </thead>
            <tbody>
              {mockPolicies.map((policy) => (
                <tr key={policy.id}>
                  <td className="px-4 py-2 border">{policy.name}</td>
                  <td className="px-4 py-2 border">{policy.startDate}</td>
                  <td className="px-4 py-2 border">{policy.endDate}</td>
                  <td className="px-4 py-2 border">{policy.coverage}</td>
                  <td className="px-4 py-2 border">{policy.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dialogOpen && <CreatePolicyDialog onClose={() => setDialogOpen(false)} />}
      </main>
    </div>
  );
}
