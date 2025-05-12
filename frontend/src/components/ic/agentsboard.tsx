'use client';

import React, { useState } from 'react';

interface Agent {
  id: number;
  username: string;
  role: string;
}

export default function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 1, username: 'agent_01', role: 'agent' },
    { id: 2, username: 'agent_02', role: 'agent' },
    { id: 3, username: 'agent_03', role: 'agent' },
  ]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const newAgent: Agent = {
      id: agents.length + 1,
      username,
      role: 'agent',
    };
    setAgents((prev) => [...prev, newAgent]);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-green-700 mb-4">Create Agent</h2>
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
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Agent List</h3>
        <ul className="divide-y divide-gray-200">
          {agents.map((agent) => (
            <li key={agent.id} className="py-2 flex justify-between text-gray-700">
              <span>{agent.username}</span>
              <span className="text-sm text-gray-500">{agent.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
