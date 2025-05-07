'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';

interface Claim {
  claimId: number;
  farmerName: string;
  policyName: string;
  claimAmount: number;
  decision: 'Triggered' | 'Exited' | 'No Action';
  status: 'Paid' | 'Pending';
}

const mockClaims: Claim[] = [
  { claimId: 1, farmerName: 'Abebe', policyName: 'Crop Cover A', claimAmount: 500, decision: 'Triggered', status: 'Paid' },
  { claimId: 2, farmerName: 'Meles', policyName: 'Crop Cover B', claimAmount: 0, decision: 'Exited', status: 'Pending' },
  { claimId: 3, farmerName: 'Lensa', policyName: 'Crop Cover A', claimAmount: 0, decision: 'No Action', status: 'Pending' },
];

export default function ViewCalculatedClaimsPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Calculated Claims</h2>

          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Claim ID</th>
                <th className="px-4 py-2 border">Farmer</th>
                <th className="px-4 py-2 border">Policy</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Decision</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockClaims.map((claim) => (
                <tr key={claim.claimId}>
                  <td className="px-4 py-2 border">{claim.claimId}</td>
                  <td className="px-4 py-2 border">{claim.farmerName}</td>
                  <td className="px-4 py-2 border">{claim.policyName}</td>
                  <td className="px-4 py-2 border">{claim.claimAmount} ETB</td>
                  <td className={`px-4 py-2 border font-semibold ${
                    claim.decision === 'Triggered' ? 'text-yellow-600' :
                    claim.decision === 'Exited' ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {claim.decision}
                  </td>
                  <td className={`px-4 py-2 border font-medium ${
                    claim.status === 'Paid' ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {claim.status}
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
