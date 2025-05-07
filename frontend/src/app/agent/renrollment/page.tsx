'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';

export default function ReEnrollmentPage() {
  const [customerId, setCustomerId] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ customerId, reason });
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 max-w-lg mx-auto rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Re-Enroll Customer</h2>
          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">Customer ID</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            />

            <label className="block mb-2 text-sm font-medium">Reason for Re-Enrollment</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            ></textarea>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Submit
            </button>

            {submitted && <p className="mt-4 text-green-600">Re-enrollment request submitted.</p>}
          </form>
        </div>
      </main>
    </div>
  );
}
