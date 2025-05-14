'use client';

import Link from 'next/link';
import { Settings, LifeBuoy } from 'lucide-react';

export default function TopNav() {
  return (
    <nav className="bg-white border-b border-[#e0e7d4] p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-[#4a635e]">
            Farmstead Admin
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <button className="text-[#7a938f] hover:text-[#4a635e] transition-colors">
            <LifeBuoy className="w-5 h-5" />
          </button>
          <button className="text-[#7a938f] hover:text-[#4a635e] transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}