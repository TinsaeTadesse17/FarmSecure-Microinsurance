'use client';

import React from 'react';
import Sidebar from '@/components/ic/sidebar';
import AvatarMenu from '@/components/common/avatar';

export default function IcDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-green-700">IC Dashboard</h1>
          <p className="mt-4 text-gray-600">
            Welcome to the Insurance Company Dashboard. Here you can view sales statistics,
            claims summaries, and commission overviews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-green-100 text-green-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">Total Policies</h3>
              <p className="text-2xl mt-2">124</p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">Active Claims</h3>
              <p className="text-2xl mt-2">8</p>
            </div>
            <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">Commission Paid</h3>
              <p className="text-2xl mt-2">ETB 23,500</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
