'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getCurrentUser } from '@/utils/api/user';
import { listPoliciesbyUser, Policy } from '@/utils/api/policy';
import {
  ScrollText,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface PolicyDetailViewProps {
  params: {
    id: string;
  };
}

export default function PolicyDetailView({ params }: PolicyDetailViewProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPolicies, setExpandedPolicies] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const user = await getCurrentUser();
        const data = await listPoliciesbyUser(Number(user.sub));
        setPolicies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch policies');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, []);

  const toggleExpand = (policyId: number) => {
    setExpandedPolicies((prev) => ({
      ...prev,
      [policyId]: !prev[policyId],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-end mb-8">
            <AvatarMenu />
          </div>
          <div className="flex items-center justify-center h-80 gap-3 text-[#3a584e]">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-lg">Loading Policy Details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-end mb-8">
            <AvatarMenu />
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] flex items-center gap-3 text-[#dc2626]">
            <AlertTriangle className="w-6 h-6" />
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <ScrollText className="w-8 h-8 text-[#8ba77f]" />
              Policy Portfolio
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Risk Coverage Details
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Comprehensive view of agricultural insurance policies and their coverage details
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="space-y-6">
          {policies.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-[#e0e7d4] text-center text-[#7a938f]">
              No active policies found
            </div>
          )}

          {policies.map((policy) => {
            const isExpanded = !!expandedPolicies[policy.policy_id];

            return (
              <div
                key={policy.policy_id}
                className="bg-white rounded-xl border border-[#e0e7d4] shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                    <div>
                      <p className="text-sm font-medium text-[#7a938f]">Policy Number</p>
                      <p className="mt-1 font-medium text-[#3a584e]">{policy.policy_no || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#7a938f]">Fiscal Year</p>
                      <p className="mt-1 text-[#3a584e]">{policy.fiscal_year || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#7a938f]">Status</p>
                      <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                        policy.status?.toLowerCase() === 'active'
                          ? 'bg-[#eef4e5] text-[#3a584e]'
                          : 'bg-[#fff3e5] text-[#d46a1a]'
                      }`}>
                        {policy.status || '—'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#7a938f]">Initiated</p>
                      <p className="mt-1 text-[#3a584e]">
                        {policy.createdAt
                          ? new Date(policy.createdAt).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(policy.policy_id)}
                    className="flex items-center text-sm font-medium text-[#8ba77f] hover:text-[#7a937f]"
                  >
                    {isExpanded ? (
                      <>
                        <span>Collapse Details</span>
                        <ChevronUp className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        <span>Expand Coverage</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>

                {isExpanded && policy.details && (
                  <div className="bg-[#f9f8f3] p-6 border-t border-[#e0e7d4]">
                    <h3 className="text-sm font-medium text-[#7a938f] mb-4">Coverage Breakdown</h3>
                    <div className="space-y-4">
                      {policy.details.map((detail: { policy_detail_id: React.Key | null | undefined; period_sum_insured: { toLocaleString: () => any; }; cps_zone: any; product_type: any; period: any; }) => (
                        <div
                          key={detail.policy_detail_id}
                          className="bg-white p-4 rounded-lg border border-[#e0e7d4]"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm font-medium text-[#7a938f]">Sum Insured</p>
                              <p className="mt-1 text-[#3a584e]">
                                ${detail.period_sum_insured?.toLocaleString() || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#7a938f]">CPS Zone</p>
                              <p className="mt-1 text-[#3a584e]">{detail.cps_zone || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#7a938f]">Product Type</p>
                              <p className="mt-1 text-[#3a584e]">{detail.product_type || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#7a938f]">Period (Days)</p>
                              <p className="mt-1 text-[#3a584e]">{detail.period || '—'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
