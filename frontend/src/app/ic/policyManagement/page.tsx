'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import CreatePolicyDialog from '@/components/ic/policyDialog';
import { listPolicies, updatePolicyStatus, Policy } from '@/utils/api/policy';
import { FiPlus, FiRefreshCw, FiSearch, FiInfo, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';

export default function PolicyManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

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
      setUpdatingId(policyId);
      await updatePolicyStatus(policyId, newStatus);
      setPolicies(policies.map(policy => 
        policy.policy_id === policyId ? { ...policy, status: newStatus } : policy
      ));
    } catch (err: any) {
      setError(err.message || `Failed to ${newStatus} policy`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      policy.policy_id.toString().toLowerCase().includes(searchTermLower) ||
      (policy.policy_no && policy.policy_no.toLowerCase().includes(searchTermLower)) ||
      policy.enrollment_id.toString().toLowerCase().includes(searchTermLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-white-50">
      <Sidebar />
      <main className="flex-1 p-6 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-900">Policy Management</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchPolicies}
              disabled={loading}
              className="p-2 rounded-full hover:bg-emerald-100 transition-colors text-emerald-700"
              title="Refresh policies"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <AvatarMenu />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-emerald-100 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search policies..."
                className="pl-10 pr-4 py-2 w-full border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-900 placeholder-emerald-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <FiPlus className="mr-2" />
              Create Policy
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-emerald-200">
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-emerald-200 h-12 w-12"></div>
                </div>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="p-8 text-center text-emerald-600">
                {searchTerm ? 'No policies match your search' : 'No policies available'}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-emerald-200">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Policy ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Policy No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Fiscal Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Sum Insured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-100">
                  {filteredPolicies.map((policy) => {
                    const totalSumInsured = policy.details?.reduce(
                      (acc, detail) => acc + (detail.period_sum_insured || 0),
                      0
                    ) ?? 0;
                    
                    return (
                      <tr key={policy.policy_id} className="hover:bg-emerald-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-900">
                          {policy.policy_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-800">
                          {policy.policy_no || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-800">
                          {policy.fiscal_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(policy.status)}`}>
                            {policy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-700">
                          ${totalSumInsured.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-800 flex space-x-2">
                          {policy.status.toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(policy.policy_id, 'approved')}
                                disabled={updatingId === policy.policy_id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                                title="Approve policy"
                              >
                                {updatingId === policy.policy_id ? (
                                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FiCheck className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(policy.policy_id, 'rejected')}
                                disabled={updatingId === policy.policy_id}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Reject policy"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors">
                            <FiInfo className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredPolicies.length > 0 && (
            <div className="mt-4 text-sm text-emerald-600">
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          )}
        </div>

        {dialogOpen && <CreatePolicyDialog onClose={() => setDialogOpen(false)} />}
      </main>
    </div>
  );
}