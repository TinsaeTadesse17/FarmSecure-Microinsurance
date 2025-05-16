import React, { useState } from 'react';
import PolicyDetailModal from '@/components/ic/policyDetail';
import { ChevronRight } from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string }> = {
  approved: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]' },
  pending: { bg: 'bg-[#fff3e0]', text: 'text-[#d4a064]' },
  rejected: { bg: 'bg-[#ffebee]', text: 'text-[#c62828]' },
  default: { bg: 'bg-[#e5f0f4]', text: 'text-[#7fa3b0]' },
};

const ClaimItem = ({ claim }: { claim: any }) => {
  const [showModal, setShowModal] = useState(false);
  const status = claim.status in statusColors ? claim.status : 'default';
  const { bg, text } = statusColors[status];

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group p-4 bg-white rounded-xl border border-[#e0e7d4] shadow-sm hover:shadow-lg hover:bg-[#f9f8f3] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-medium text-[#3a584e]">#{claim.id}</span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${bg} ${text} font-medium`}
              >
                {claim.status}
              </span>
            </div>
            <div className="text-[#5a736e] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#7a938f]">Type:</span>
                <span className="capitalize text-[#3a584e]">
                  {claim.claim_type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#7a938f]">Grid ID:</span>
                <span className="font-mono text-[#3a584e]">
                  {claim.grid_id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-[#7a938f]">
              {new Date(claim.createdAt).toLocaleDateString()}
            </span>
            <ChevronRight className="w-4 h-4 text-[#7a938f] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {showModal && (
        <PolicyDetailModal
          policyId={claim.policy_id}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ClaimItem;