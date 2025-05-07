'use client';

import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Company Dashboard</h1>
      <nav className="space-y-4">
        <Link href="/ic/agentsboard" className="block text-black hover:text-green-600">
          Agents
        </Link>
        <Link href="/ic/productConfig" className="block text-black hover:text-green-600">
          Products
        </Link>
        <Link href="/ic/polcyManagement" className="block text-black hover:text-green-600">
          Policies
        </Link>
        <Link href="/ic/refund" className="block text-black hover:text-green-600">
          Refund
        </Link>
        <Link href="/ic/ndvi" className="block text-black hover:text-green-600">
          ndvi
        </Link>
        <Link href="/ic/triggerDecision" className="block text-black hover:text-green-600">
          trigger
        </Link>
        <Link href="/ic/calculatedClaims" className="block text-black hover:text-green-600">
          claims
        </Link>
        <Link href="/ic/bulkPayment" className="block text-black hover:text-green-600">
          payment
        </Link>
        <Link href="/ic/settlement" className="block text-black hover:text-green-600">
          settlement
        </Link>
        <Link href="/ic/comission" className="block text-black hover:text-green-600">
          comission
        </Link>
        <Link href="/ic/ndviVis" className="block text-black hover:text-green-600">
          NDVI Visualisation
        </Link>
      </nav>
    </aside>
  );
}
