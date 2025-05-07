'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';

export default function CollectPremiumPage() {
  const [policyId, setPolicyId] = useState('');
  const [amount, setAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement backend call here
    console.log({ policyId, amount });
    setSuccessMessage(`Premium of ETB ${amount} collected for Policy ID ${policyId}`);
    setPolicyId('');
    setAmount('');
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-8 rounded shadow-md max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Collect Premium</h2>
          <form onSubmit={handleSubmit}>
            <label className="block mb-2 font-medium">Policy ID</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              required
            />

            <label className="block mb-2 font-medium">Premium Amount (ETB)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>

            {successMessage && (
              <p className="text-green-600 mt-4 font-medium">{successMessage}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
