'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getPolicy, listPolicyDetails, Policy } from '@/utils/api/policy';

interface PolicyDetail {
  policy_detail_id: number;
  customer_id: number;
  policy_id: number;
  period_sum_insured: number;
  cps_zone: string;
  product_type: number;
  period: number;
}

interface PolicyDetailViewProps {
  params: {
    id: string;
  };
}

export default function PolicyDetailView({ params }: PolicyDetailViewProps) {
  const [policies, setPolicies] = useState<Record<number, Policy>>({});
  const [groupedDetails, setGroupedDetails] = useState<Record<number, PolicyDetail[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPolicies, setExpandedPolicies] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const detailsRes = (await listPolicyDetails()) as PolicyDetail[];
        
        const detailsByPolicyId = detailsRes.reduce((acc: Record<number, PolicyDetail[]>, detail) => {
          if (!acc[detail.policy_id]) {
            acc[detail.policy_id] = [];
          }
          acc[detail.policy_id].push(detail);
          return acc;
        }, {});

        const policyIds = Object.keys(detailsByPolicyId).map(Number);
        const policyPromises = policyIds.map((policyId) => getPolicy(policyId));
        const policyResponses = await Promise.all(policyPromises);

        const policyMap = policyResponses.reduce((acc: Record<number, Policy>, policy) => {
          acc[policy.policy_id] = policy;
          return acc;
        }, {});

        setPolicies(policyMap);
        setGroupedDetails(detailsByPolicyId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch policy details');
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
      <div className="flex min-h-screen bg-gray-50 text-black">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-end mb-6">
            <AvatarMenu />
          </div>
          <div className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-sm">
            <p>Loading policy details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 text-black">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-end mb-6">
            <AvatarMenu />
          </div>
          <div className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-sm">
            <p className="text-gray-700">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Policy Overview</h2>
          {Object.keys(groupedDetails).length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-500">No policies found.</p>
            </div>
          )}
          <div className="grid gap-6">
            {Object.entries(groupedDetails).map(([policyIdStr, details]) => {
              const policyId = Number(policyIdStr);
              const policy = policies[policyId];
              const isExpanded = !!expandedPolicies[policyId];

              if (!policy) {
                console.warn(`Policy data missing for policy_id: ${policyId}`);
                return null;
              }

              return (
                <div
                  key={policyId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Policy Number</p>
                        <p className="mt-1">{policy.policy_no || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fiscal Year</p>
                        <p className="mt-1">{policy.fiscal_year || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 capitalize">{policy.status?.toLowerCase() || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1">
                          {policy.createdAt
                            ? new Date(policy.createdAt).toLocaleDateString()
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(policyId)}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-black"
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide details</span>
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>View details</span>
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="bg-gray-50 p-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Policy Details</h3>
                      <div className="space-y-4">
                        {details.length === 0 && (
                          <p className="text-gray-500">No details available</p>
                        )}
                        {details.map((detail) => (
                          <div
                            key={detail.policy_detail_id}
                            className="bg-white p-4 rounded-md shadow-sm border border-gray-100"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Sum Insured</p>
                                <p className="mt-1">{detail.period_sum_insured || '—'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">CPS Zone</p>
                                <p className="mt-1">{detail.cps_zone || '—'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Product Type</p>
                                <p className="mt-1">{detail.product_type || '—'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Period</p>
                                <p className="mt-1">{detail.period || '—'}</p>
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
        </div>
      </main>
    </div>
  );
}