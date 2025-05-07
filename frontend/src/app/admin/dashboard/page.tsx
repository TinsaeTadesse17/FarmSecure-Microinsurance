'use client';

import React from 'react';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-6">
          <AvatarMenu />
        </div>

        <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-green-700">Admin Dashboard</h1>
          <p className="mt-4 text-gray-600">
            Welcome to the Admin Dashboard. Here you can oversee system-wide statistics across
            all insurance companies.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-purple-100 text-purple-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">Total Companies</h3>
              <p className="text-2xl mt-2">12</p>
            </div>
            <div className="bg-red-100 text-red-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">Pending Approvals</h3>
              <p className="text-2xl mt-2">4</p>
            </div>
            <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">Total Users</h3>
              <p className="text-2xl mt-2">58</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
