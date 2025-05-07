'use client';

import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Admin Dashboard</h1>
      <nav className="space-y-4">
        <Link href="/admin" className="block text-black hover:text-green-600">
          Pending Companies
        </Link>
        <Link href="/admin/dashboard" className="block text-black hover:text-green-600">
          dashboard
        </Link>
        <Link href="/settings" className="block text-black hover:text-green-600">
          Settings
        </Link>
      </nav>
    </aside>
  );
}
