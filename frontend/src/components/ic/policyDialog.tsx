'use client';

import React, { useState } from 'react';
import { createPolicy } from '@/lib/api/policy';

interface CreatePolicyDialogProps {
  onClose: () => void;
}

export default function CreatePolicyDialog({ onClose }: CreatePolicyDialogProps) {
  // const [policyName, setPolicyName] = useState('');
  // const [startDate, setStartDate] = useState('');
  // const [endDate, setEndDate] = useState('');
  // const [coverage, setCoverage] = useState('');
  // const [premium, setPremium] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const policyData = {
        enrollment_id: parseInt(enrollmentId),
      };
      await createPolicy(policyData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create policy');
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-96 shadow-xl text-black">
        <h2 className="text-lg font-semibold mb-4">Create Policy</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Enrollment ID</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            required
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

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
