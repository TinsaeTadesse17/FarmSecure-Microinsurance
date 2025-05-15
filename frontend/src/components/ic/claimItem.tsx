import React, { useState } from 'react';
import PolicyDetailModal from '@/components/ic/policyDetail';

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending:  'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  default:  'bg-blue-100 text-blue-800',
};

const ClaimItem = ({ claim }: { claim: any }) => {
  const [showModal, setShowModal] = useState(false);

  // pick the right color, or fall back to `default`
  const pillClass = statusColors[claim.status] ?? statusColors.default;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-medium text-gray-900">#{claim.id}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${pillClass}`}
              >
                {claim.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{claim.claim_type}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Grid ID:</span>
                <span className="font-mono">{claim.grid_id}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">
              {new Date(claim.createdAt).toLocaleDateString()}
            </span>
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
