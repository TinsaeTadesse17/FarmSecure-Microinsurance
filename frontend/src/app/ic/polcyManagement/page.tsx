'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreatePolicyDialog from '@/components/ic/policyDialog';
import { listPolicies, Policy } from '@/lib/api/policy';

export default function PolicyManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const data = await listPolicies();
        setPolicies(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load policies');
      }
    }
    fetchPolicies();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Policy Management</h2>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Policy
            </button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <table className="w-full text-left border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Policy ID</th>
                <th className="px-4 py-2 border">Enrollment ID</th>
                <th className="px-4 py-2 border">Policy No</th>
                <th className="px-4 py-2 border">Fiscal Year</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Sum Insured (Total)</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => {
                const totalSumInsured = policy.details?.reduce((acc: any, detail: { period_sum_insured: any; }) => acc + detail.period_sum_insured, 0) ?? 0;
                return (
                  <tr key={policy.policy_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{policy.policy_id}</td>
                    <td className="px-4 py-2 border">{policy.enrollment_id}</td>
                    <td className="px-4 py-2 border">{policy.policy_no}</td>
                    <td className="px-4 py-2 border">{policy.fiscal_year}</td>
                    <td className="px-4 py-2 border capitalize">{policy.status}</td>
                    <td className="px-4 py-2 border">{totalSumInsured.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {dialogOpen && <CreatePolicyDialog onClose={() => setDialogOpen(false)} />}
      </main>
    </div>
  );
}
