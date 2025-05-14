'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import {
  getAgentUsers,
  updateUserAccount,
  createAgentUser,
  getCurrentUser,
  UserOut,
  getToken,
} from '@/utils/api/user';

interface FetchState {
  data: UserOut[];
  loading: boolean;
  error: string | null;
}

const statusOptions = ['approved', 'pending', 'rejected'];

const statusColors = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<FetchState>({ data: [], loading: false, error: null });
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      setAgents(prev => ({ ...prev, loading: true, error: null }));

      const token = getToken();
      if (!token) {
        setAgents({ data: [], loading: false, error: 'No authentication token found. Please log in.' });
        return;
      }

      try {
        const agentData = await getAgentUsers(token);
        const sortedAgents = [...agentData].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAgents({ data: sortedAgents, loading: false, error: null });

        const current = await getCurrentUser(token);
        setCompanyId(current.company_id);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch agents';
        setAgents(prev => ({ ...prev, loading: false, error: msg }));
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.data.filter(agent =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async () => {
    if (!selectedUser || !selectedStatus) return;

    const token = getToken();
    if (!token) {
      setAgents(prev => ({ ...prev, error: 'No authentication token found. Please log in.' }));
      return;
    }

    try {
      await updateUserAccount(selectedUser.user_id, { status: selectedStatus }, token);
      setAgents(prev => ({
        ...prev,
        data: prev.data.map(u =>
          u.user_id === selectedUser.user_id ? { ...u, status: selectedStatus } : u
        ),
      }));
      setShowStatusModal(false);
    } catch (error) {
      setAgents(prev => ({ ...prev, error: (error as Error).message }));
    }
  };

  const handleCreateAgent = async () => {
    setShowCreateModal(false);
    const token = getToken();
    if (!token || companyId === null || !newAgentEmail) {
      setAgents(prev => ({ ...prev, error: 'Cannot determine company or missing email.' }));
      return;
    }

    try {
      setIsCreating(true);
      await createAgentUser({ role: 'agent', company_id: companyId, email: newAgentEmail }, token);
      const updated = await getAgentUsers(token);
      const sortedAgents = [...updated].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAgents({ data: sortedAgents, loading: false, error: null });
    } catch (error) {
      setAgents(prev => ({ ...prev, error: (error as Error).message }));
    } finally {
      setIsCreating(false);
      setNewAgentEmail('');
    }
  };

  const renderStatusPill = (user: UserOut) => (
    <div
      className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer ${statusColors[user.status as keyof typeof statusColors]}`}
      onClick={() => {
        setSelectedUser(user);
        setSelectedStatus(user.status);
        setShowStatusModal(true);
      }}
    >
      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
    </div>
  );

  const renderTable = (state: FetchState) => {
    if (state.loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600" />
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-rose-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-rose-700">{state.error}</p>
          </div>
        </div>
      );
    }

    if (filteredAgents.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500">{searchTerm ? 'Try a different search term' : 'Create your first agent'}</p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
              >
                Create Agent
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAgents.map(user => (
              <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-medium border border-emerald-100">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{renderStatusPill(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Agent Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your team agents and permissions</p>
          </div>
          <AvatarMenu />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full sm:w-96 border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isCreating}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-70"
              >
                {isCreating ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
            {renderTable(agents)}
          </div>
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-transparent flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Create New Agent</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAgentEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <input
                type="email"
                required
                placeholder="Agent's email"
                value={newAgentEmail}
                onChange={(e) => setNewAgentEmail(e.target.value)}
                className="mt-4 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAgentEmail('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={!newAgentEmail || isCreating}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md disabled:opacity-60"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium mb-2">Change Status for {selectedUser.username}</h3>
              {statusOptions.map(option => (
                <div key={option} className="flex items-center mb-2">
                  <input
                    id={`status-${option}`}
                    name="status"
                    type="radio"
                    checked={selectedStatus === option}
                    onChange={() => setSelectedStatus(option)}
                    className="h-4 w-4 text-emerald-600"
                  />
                  <label htmlFor={`status-${option}`} className="ml-2 capitalize">{option}</label>
                </div>
              ))}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentsPage;
