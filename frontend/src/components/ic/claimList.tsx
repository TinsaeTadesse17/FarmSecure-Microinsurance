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
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Processed Claims</h3>
      <div className="space-y-3">
        {uniqueClaims.map((claim) => (
          <ClaimItem key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
};

export default ClaimsList;
