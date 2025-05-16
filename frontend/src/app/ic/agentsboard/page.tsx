'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { Sprout, UserPlus, Search } from 'lucide-react';
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
  approved: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100/80 text-amber-800 border-amber-200',
  rejected: 'bg-rose-100/80 text-rose-800 border-rose-200',
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
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      setAgents(prev => ({ ...prev, loading: true, error: null }));
      const token = getToken();
      if (!token) {
        setAgents({ data: [], loading: false, error: 'No authentication token found. Please log in.' });
        setHasFetched(true);
        return;
      }
      try {
        const agentData = await getAgentUsers(token);
        const sortedAgents = [...agentData].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAgents({ data: sortedAgents, loading: false, error: null });
      } catch (err: any) {
        const msg = err.message || '';
        const status = err.response?.status;
        if (status === 404 || msg.toLowerCase().includes('no agents found')) {
          setAgents({ data: [], loading: false, error: null });
        } else {
          setAgents(prev => ({ ...prev, loading: false, error: msg || 'Failed to fetch agents' }));
        }
      } finally {
        setHasFetched(true);
        if (token && companyId === null) {
          try {
            const current = await getCurrentUser(token);
            setCompanyId(current.company_id);
          } catch {}
        }
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
        data: prev.data.map(u => (u.user_id === selectedUser.user_id ? { ...u, status: selectedStatus } : u)),
      }));
      setShowStatusModal(false);
    } catch (err: any) {
      setAgents(prev => ({ ...prev, error: err.message }));
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
      const sortedAgents = [...updated].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAgents({ data: sortedAgents, loading: false, error: null });
    } catch (err: any) {
      setAgents(prev => ({ ...prev, error: err.message }));
    } finally {
      setIsCreating(false);
      setNewAgentEmail('');
    }
  };

  const renderStatusPill = (user: UserOut) => (
    <div
      className={`px-3 py-1 text-sm font-medium rounded-full border cursor-pointer transition-colors ${
        statusColors[user.status as keyof typeof statusColors]
      } hover:brightness-95`}
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
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8ba77f]" />
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
    if (hasFetched && filteredAgents.length === 0) {
      return (
        <div className="text-center py-12 bg-[#f9f8f3] rounded-lg border-2 border-dashed border-[#e0e7d4]">
          <Sprout className="mx-auto h-12 w-12 text-[#7a938f]" />
          <h3 className="mt-4 text-lg font-medium text-[#3a584e]">No agents found</h3>
          <p className="mt-2 text-sm text-[#7a938f]">
            {searchTerm ? 'No matches for your search' : 'Get started by inviting a new agent'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-colors"
            >
              <UserPlus className="inline mr-2 h-4 w-4" />
              Invite Agent
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="overflow-hidden border border-[#e0e7d4] rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-[#e0e7d4]">
          <thead className="bg-[#f9f8f3]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#3a584e]">Agent</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#3a584e]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e0e7d4]">
            {filteredAgents.map(user => (
              <tr key={user.user_id} className="hover:bg-[#f9f8f3] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#eef4e5] flex items-center justify-center text-[#3a584e] font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[#3a584e]">{user.username}</div>
                      {user.email && <div className="text-sm text-[#7a938f]">{user.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{renderStatusPill(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <Sprout className="w-8 h-8 text-[#8ba77f]" />
              Agent Management
              <span className="ml-4 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">Admin View</span>
            </h1>
            <p className="mt-2 text-[#7a938f]">Manage agent accounts and permissions</p>
          </div>
          <AvatarMenu />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a938f]" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isCreating}
                className="px-4 py-2.5 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isCreating ? 'Creating...' : 'New Agent'}
              </button>
            </div>
            {renderTable(agents)}
          </div>
        </div>

        {/* Modals */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#3a584e]">Invite New Agent</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-[#7a938f] hover:text-[#3a584e]">✕</button>
              </div>
              <input
                type="email"
                placeholder="Enter agent email"
                value={newAgentEmail}
                onChange={e => setNewAgentEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] mb-6"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-[#3a584e] hover:bg-[#f9f8f3] rounded-lg">Cancel</button>
                <button
                  onClick={handleCreateAgent}
                  disabled={!newAgentEmail || isCreating}
                  className="px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f] disabled:opacity-70"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}
        {showStatusModal && selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-[#e0e7d4] shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-[#3a584e] mb-4">Update Status</h3>
              <p className="text-sm text-[#7a938f] mb-6">For {selectedUser.username}</p>
              <div className="space-y-3 mb-6">
                {statusOptions.map(option => (
                  <label key={option} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f9f8f3] cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedStatus === option}
                      onChange={() => setSelectedStatus(option)}
                      className="h-4 w-4 text-[#8ba77f] focus:ring-[#8ba77f]"
                    />
                    <span className="capitalize text-[#3a584e]">{option}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-[#3a584e] hover:bg-[#f9f8f3] rounded-lg">Cancel</button>
                <button onClick={handleStatusChange} className="px-4 py-2 bg-[#8ba77f] text-white rounded-lg hover:bg-[#7a937f]">Update Status</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentsPage;