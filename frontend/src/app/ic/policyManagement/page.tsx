'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreatePolicyDialog from '@/components/ic/policyDialog';
import PolicyDetailModal from '@/components/ic/policyDetail';
import { listPolicies, approvePolicy, rejectPolicy, Policy } from '@/utils/api/policy';
import { Plus, RefreshCw, Search, AlertCircle, ClipboardList, Sprout } from 'lucide-react';
import { getCurrentUser } from '@/utils/api/user'; // Assuming this fetches the current user details

export default function PolicyManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; policy: Policy | null }>({
    open: false,
    policy: null,
  });
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [userCompanyId, setUserCompanyId] = useState<number | null>(null);

  useEffect(() => {
    fetchPolicies();
    fetchCurrentUser(); // Fetch current user to get their company_id
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setUserCompanyId(user.company_id); // Store the user's company_id
    } catch (err) {
      setError('Failed to fetch user data');
    }
  };

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await listPolicies();
      setPolicies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (policyId: number, newStatus: 'approved' | 'rejected') => {
    try {
      let updatedPolicy: Policy;

      if (newStatus === 'approved') {
        updatedPolicy = await approvePolicy(policyId);
      } else {
        updatedPolicy = await rejectPolicy(policyId);
      }

      setPolicies(policies.map(policy =>
        policy.policy_id === policyId ? updatedPolicy : policy
      ));
    } catch (err: any) {
      setError(err.message || `Failed to ${newStatus} policy`);
    }
  };

  // Filter policies to only show those that belong to the user's company_id
  const filteredPolicies = policies.filter(policy => {
    const searchTermLower = searchTerm.toLowerCase();
    const isPolicyBelongsToUserCompany = policy.ic_company_id === userCompanyId;
    const isSearchMatch =
      policy.policy_id.toString().toLowerCase().includes(searchTermLower) ||
      (policy.policy_no && policy.policy_no.toLowerCase().includes(searchTermLower)) ||
      policy.enrollment_id.toString().toLowerCase().includes(searchTermLower);
    
    return isPolicyBelongsToUserCompany && isSearchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-[#e8f5e9] text-[#2e7d32]';
      case 'pending': return 'bg-[#fff3e0] text-[#ef6c00]';
      case 'rejected': return 'bg-[#ffebee] text-[#c62828]';
      default: return 'bg-[#f5f5f5] text-[#616161]';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-6 transition-all duration-300">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Sprout className="w-8 h-8 text-[#8ba77f]" />
              Policy Management
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                Insurance Cooperative
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f]">
              Manage and monitor agricultural insurance policies
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchPolicies}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-[#eef4e5] transition-colors text-[#3a584e]"
              title="Refresh policies"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <AvatarMenu />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e7d4] p-6 shadow-sm max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7a938f]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search policies..."
                className="pl-10 pr-4 py-2 w-full border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] text-[#3a584e] placeholder-[#7a938f] bg-[#f9f8f3]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Policy
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-300 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-[#e0e7d4]">
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-[#e0e7d4] h-12 w-12"></div>
                </div>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="p-8 text-center text-[#7a938f] flex flex-col items-center gap-2">
                <ClipboardList className="w-8 h-8" />
                {searchTerm ? 'No matching policies found' : 'No policies available'}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#e0e7d4]">
                <thead className="bg-[#f9f8f3]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#3a584e] uppercase tracking-wider">Policy ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#3a584e] uppercase tracking-wider">Policy No</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#3a584e] uppercase tracking-wider">Fiscal Year</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#3a584e] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#3a584e] uppercase tracking-wider">Sum Insured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e7d4] bg-white">
                  {filteredPolicies.map((policy) => {
                    const totalSumInsured = policy.details?.reduce(
                      (acc: any, detail: { period_sum_insured: any; }) => acc + (detail.period_sum_insured || 0),
                      0
                    ) ?? 0;

                    return (
                      <tr
                        key={policy.policy_id}
                        className="hover:bg-[#f9f8f3] transition-colors cursor-pointer"
                        onClick={() => setSelectedPolicyId(policy.policy_id)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#3a584e]">
                          {policy.policy_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#7a938f]">
                          {policy.policy_no || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#7a938f]">
                          {policy.fiscal_year}
                        </td>
                        <td
                          className="px-6 py-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusDialog({ open: true, policy });
                          }}
                        >
                          <button className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(policy.status)} hover:opacity-90 transition-opacity`}>
                            {policy.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#3a584e]">
                          ${totalSumInsured.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredPolicies.length > 0 && (
            <div className="mt-4 text-sm text-[#7a938f]">
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          )}
        </div>

        {statusDialog.open && statusDialog.policy && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm border">
              <h2 className="text-lg font-semibold text-emerald-800 mb-4">
                Change Status for this policy
              </h2>
              <p className="text-sm text-gray-700 mb-6">
                Choose the new status for this policy.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={async () => {
                    await handleUpdateStatus(statusDialog.policy!.policy_id, 'approved');
                    setStatusDialog({ open: false, policy: null });
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Approve
                </button>
                <button
                  onClick={async () => {
                    await handleUpdateStatus(statusDialog.policy!.policy_id, 'rejected');
                    setStatusDialog({ open: false, policy: null });
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => setStatusDialog({ open: false, policy: null })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {dialogOpen && <CreatePolicyDialog onClose={() => setDialogOpen(false)} />}

        {typeof selectedPolicyId === 'number' && (
          <PolicyDetailModal
            policyId={selectedPolicyId}
            onClose={() => setSelectedPolicyId(null)}
          />
        )}
      </main>
    </div>
  );
}
