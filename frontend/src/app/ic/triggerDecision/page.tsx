'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { SatelliteDish, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <SatelliteDish className="w-8 h-8 text-[#8ba77f]" />
              NDVI Monitoring
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Real-time Updates
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Monitor vegetation indices and manage insurance triggers • Updated every 15 minutes
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e0e7d4]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#3a584e]">Policy Triggers</h2>
                <p className="text-sm text-[#7a938f] mt-1">
                  Active policies with NDVI-based trigger thresholds
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9f8f3] border-b border-[#e0e7d4]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">Policy ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">Farmer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">NDVI Avg</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">Trigger Threshold</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">Exit Threshold</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#3a584e]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e7d4]">
                {mockClaims.map((claim) => {
                  let action = 'No Action';
                  if (claim.ndviAvg <= claim.exitThreshold) action = 'Exit';
                  else if (claim.ndviAvg <= claim.triggerThreshold) action = 'Trigger';

                  return (
                    <tr 
                      key={claim.policyId}
                      className="hover:bg-[#f9f8f3] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#3a584e]">
                        #{claim.policyId}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#7a938f]">
                        {claim.farmerName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#3a584e]">
                        <span className="font-mono">{claim.ndviAvg.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#7a938f]">
                        {claim.triggerThreshold.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#7a938f]">
                        {claim.exitThreshold.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          action === 'Exit' 
                            ? 'bg-[#fee2e2] text-[#dc2626]' 
                            : action === 'Trigger' 
                            ? 'bg-[#fff3e5] text-[#d46a1a]' 
                            : 'bg-[#eef4e5] text-[#3a584e]'
                        }`}>
                          {action === 'Exit' ? (
                            <XCircle className="w-4 h-4 mr-2" />
                          ) : action === 'Trigger' ? (
                            <AlertTriangle className="w-4 h-4 mr-2" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          {action}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}