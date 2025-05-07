'use client';

import React, { useState } from 'react';

interface CreatePolicyDialogProps {
  onClose: () => void;
}

export default function CreatePolicyDialog({ onClose }: CreatePolicyDialogProps) {
  const [policyName, setPolicyName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverage, setCoverage] = useState('');
  const [premium, setPremium] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ policyName, startDate, endDate, coverage, premium });
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-96 shadow-xl text-black">
        <h2 className="text-lg font-semibold mb-4">Create Policy</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Policy Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">End Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Coverage Amount</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={coverage}
            onChange={(e) => setCoverage(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Premium</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
