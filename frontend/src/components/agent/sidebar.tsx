'use client';

import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Agent Dashboard</h1>
      <nav className="space-y-4">
        <Link href="/agent" className="block text-black hover:text-green-600">
          Enrollment
        </Link>
        <Link href="/agent/premium" className="block text-black hover:text-green-600">
          Premium
        </Link>
        <Link href="/agent/renrollment" className="block text-black hover:text-green-600">
          renrollment
        </Link>
        <Link href="/agent/policy" className="block text-black hover:text-green-600">
          policy
        </Link>
      </nav>
    </aside>
  );
}
