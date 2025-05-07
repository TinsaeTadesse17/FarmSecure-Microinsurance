'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';

interface ClaimEntry {
  policyId: number;
  farmerName: string;
  ndviAvg: number;
  triggerThreshold: number;
  exitThreshold: number;
}

const mockClaims: ClaimEntry[] = [
  { policyId: 101, farmerName: 'Abebe', ndviAvg: 0.35, triggerThreshold: 0.45, exitThreshold: 0.30 },
  { policyId: 102, farmerName: 'Meles', ndviAvg: 0.25, triggerThreshold: 0.40, exitThreshold: 0.28 },
  { policyId: 103, farmerName: 'Lensa', ndviAvg: 0.55, triggerThreshold: 0.50, exitThreshold: 0.35 },
];

export default function TriggerDecisionPage() {
  const [decisions, setDecisions] = useState<Record<number, string>>({});

  const handleDecision = (policyId: number, decision: string) => {
    setDecisions((prev) => ({ ...prev, [policyId]: decision }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Trigger / Exit Point Decisions</h2>

          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Policy ID</th>
                <th className="px-4 py-2 border">Farmer</th>
                <th className="px-4 py-2 border">NDVI Avg</th>
                <th className="px-4 py-2 border">Trigger Threshold</th>
                <th className="px-4 py-2 border">Exit Threshold</th>
                <th className="px-4 py-2 border">Decision</th>
              </tr>
            </thead>
            <tbody>
              {mockClaims.map((claim) => {
                let action = 'No Action';
                if (claim.ndviAvg <= claim.exitThreshold) action = 'Exit';
                else if (claim.ndviAvg <= claim.triggerThreshold) action = 'Trigger';

                return (
                  <tr key={claim.policyId}>
                    <td className="px-4 py-2 border">{claim.policyId}</td>
                    <td className="px-4 py-2 border">{claim.farmerName}</td>
                    <td className="px-4 py-2 border">{claim.ndviAvg}</td>
                    <td className="px-4 py-2 border">{claim.triggerThreshold}</td>
                    <td className="px-4 py-2 border">{claim.exitThreshold}</td>
                    <td className="px-4 py-2 border">
                      <span className={`font-semibold ${action === 'Exit' ? 'text-red-600' : action === 'Trigger' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
