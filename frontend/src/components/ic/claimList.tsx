import React from 'react';
import ClaimItem from '@/components/ic/claimItem';

const ClaimsList = ({ claims }: { claims: any[] }) => {
  const uniqueClaims = Object.values(
    claims.reduce((acc: Record<number, any>, claim) => {
      if (!acc[claim.policy_id]) {
        acc[claim.policy_id] = claim;
      }
      return acc;
    }, {})
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.15)] border border-[#e0e7d4] max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#3a584e] flex items-center gap-2">
          <span>Processed Claims</span>
          <span className="text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
            {uniqueClaims.length} Entries
          </span>
        </h3>
      </div>
      
      <div className="space-y-4">
        {uniqueClaims.map((claim) => (
          <ClaimItem key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
};

export default ClaimsList;