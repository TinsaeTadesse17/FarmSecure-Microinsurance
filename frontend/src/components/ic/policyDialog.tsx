'use client';

import React, { useState } from 'react';
import { createPolicy } from '@/utils/api/policy';
import { X, ClipboardList, Sprout } from 'lucide-react';

interface CreatePolicyDialogProps {
  onClose: () => void;
}

export default function CreatePolicyDialog({ onClose }: CreatePolicyDialogProps) {
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.25)] border border-[#e0e7d4]">
        <div className="flex justify-between items-center p-6 border-b border-[#e0e7d4]">
          <h2 className="text-xl font-bold text-[#3a584e] flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#8ba77f]" />
            New Policy Setup
          </h2>
          <button
            onClick={onClose}
            className="text-[#7a938f] hover:text-[#5a736e] p-1 rounded-full hover:bg-[#eef4e5] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#7a938f] mb-2">
                Enrollment ID
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#e0e7d4] rounded-lg focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] outline-none transition-all"
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-[#ffebee] p-3 rounded-lg border border-[#ffcdd2]">
                <p className="text-sm text-[#c62828]">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#5a736e] hover:text-[#3a584e] hover:bg-[#eef4e5] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                Create Policy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}