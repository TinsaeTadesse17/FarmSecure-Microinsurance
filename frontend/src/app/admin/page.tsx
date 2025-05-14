'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import AdminDashboard from '@/components/admin/dashboard';
import { Sprout } from 'lucide-react';

interface TokenPayload {
  sub: string;
  username: string;
  role: string[] | string;
  company_id: (string | null)[];
  exp: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      const isAdmin = Array.isArray(decoded.role)
        ? decoded.role.includes('admin')
        : decoded.role === 'admin';

      if (!isAdmin) {
        router.replace('/');
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Invalid token:', err);
      router.replace('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin-slow mx-auto">
            <Sprout className="w-12 h-12 text-[#8ba77f]" />
          </div>
          <p className="text-[#3a584e] font-medium">
            Cultivating your admin dashboard...
          </p>
          <span className="text-sm text-[#7a938f] block">
            Securely growing your access permissions
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#3a584e]">
      <AdminDashboard />
    </div>
  );
}