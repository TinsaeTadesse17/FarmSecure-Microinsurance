'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, Users, Sprout } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#f9f8f3] border-r border-[#e0e7d4] p-6">
      <div className="flex items-center gap-3 mb-8">
        <Sprout className="w-7 h-7 text-[#8ba77f]" />
        <h1 className="text-xl font-semibold text-[#3a584e]">
          AgriAdmin
        </h1>
      </div>
      
      <nav className="space-y-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 p-3 rounded-lg text-[#5a736e] hover:bg-[#eef4e5] hover:text-[#3a584e] transition-all"
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        
        <Link
          href="/admin"
          className="flex items-center gap-3 p-3 rounded-lg text-[#5a736e] hover:bg-[#eef4e5] hover:text-[#3a584e] transition-all"
        >
          <ClipboardList className="w-5 h-5" />
          Pending Companies
        </Link>
        
        <Link
          href="/admin/users"
          className="flex items-center gap-3 p-3 rounded-lg text-[#5a736e] hover:bg-[#eef4e5] hover:text-[#3a584e] transition-all"
        >
          <Users className="w-5 h-5" />
          User Management
        </Link>
      </nav>

      <div className="mt-8 pt-6 border-t border-[#e0e7d4]">
        <div className="text-sm text-[#7a938f] px-3">
          &copy; 2025 AgriTeck. All rights reserved.
        </div>
      </div>
    </aside>
  );
}