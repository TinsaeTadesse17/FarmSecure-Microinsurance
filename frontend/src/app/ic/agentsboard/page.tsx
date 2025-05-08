'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import IcDashboard from '@/components/ic/dashboard';

interface TokenPayload {
  sub: string;
  username: string;
  role: string[] | string;
  company_id: (string | null)[];
  exp: number;
}

interface Agent {
  id: number;
  username: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AgentManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 1, username: 'agent_01', role: 'agent', status: 'pending' },
    { id: 2, username: 'agent_02', role: 'agent', status: 'approved' },
    { id: 3, username: 'agent_03', role: 'agent', status: 'rejected' },
  ]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      const isAdmin = Array.isArray(decoded.role)
        ? decoded.role.includes('ic')
        : decoded.role === 'ic';

      if (!isAdmin) {
        router.replace('/');
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Invalid token:', err);
      router.replace('/login');
    }
  }, [router]);

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const newAgent: Agent = {
      id: agents.length + 1,
      username,
      role: 'agent',
      status: 'pending',
    };
    setAgents((prev) => [...prev, newAgent]);
    setUsername('');
    setPassword('');
  };

  const handleStatusChange = (agentId: number, newStatus: 'approved' | 'rejected') => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, status: newStatus } : agent
    ));
  };

  const getStatusButtonClass = (status: string, currentStatus: string) => {
    const baseClass = "px-3 py-1 rounded-md text-sm font-medium";
    if (status === currentStatus) {
      return `${baseClass} ${
        status === 'approved' ? 'bg-green-100 text-green-800' :
        status === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`;
    }
    return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200`;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <IcDashboard>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        {/* <h2 className="text-2xl font-semibold text-green-700 mb-4">Create Agent</h2>
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div>
            <label htmlFor="username" className="block font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter agent username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Create Agent
          </button>
        </form> */}

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Agent List</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-100 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-100 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-100 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agent.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.status === 'approved' ? 'bg-green-100 text-green-800' :
                        agent.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button
                        onClick={() => handleStatusChange(agent.id, 'approved')}
                        className={getStatusButtonClass('approved', agent.status)}
                        disabled={agent.status === 'approved'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(agent.id, 'rejected')}
                        className={getStatusButtonClass('rejected', agent.status)}
                        disabled={agent.status === 'rejected'}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </IcDashboard>
  );
}