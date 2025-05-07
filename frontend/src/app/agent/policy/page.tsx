'use client';

import React from 'react';
import Sidebar from '@/components/agent/sidebar';
import AvatarMenu from '@/components/common/avatar';

const mockPolicy = {
  id: 'POLICY123',
  customer: 'John Doe',
  product: 'Crop Cover B',
  startDate: '2024-12-01',
  endDate: '2025-05-31',
  coverage: 'ETB 50,000',
  premium: 'ETB 1,500',
  status: 'Active',
};

export default function PolicyDetailView() {
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-6 max-w-2xl mx-auto rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Policy Details</h2>
          <div className="space-y-2">
            <p><strong>Policy ID:</strong> {mockPolicy.id}</p>
            <p><strong>Customer:</strong> {mockPolicy.customer}</p>
            <p><strong>Product:</strong> {mockPolicy.product}</p>
            <p><strong>Start Date:</strong> {mockPolicy.startDate}</p>
            <p><strong>End Date:</strong> {mockPolicy.endDate}</p>
            <p><strong>Coverage:</strong> {mockPolicy.coverage}</p>
            <p><strong>Premium:</strong> {mockPolicy.premium}</p>
            <p><strong>Status:</strong> {mockPolicy.status}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
