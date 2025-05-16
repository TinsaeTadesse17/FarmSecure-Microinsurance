'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import IcDashboard from '@/components/ic/dashboard';
import { RefreshCw } from 'lucide-react';

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
      
      // Check token expiration
      if (Date.now() >= decoded.exp * 1000) {
        throw new Error('Token expired');
      }

      const isAdmin = Array.isArray(decoded.role)
        ? decoded.role.includes('ic')
        : decoded.role === 'ic';

      if (!isAdmin) {
        router.replace('/');
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Authentication error:', err);
      router.replace('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f9f8f3] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#3a584e]">
          <RefreshCw className="w-12 h-12 animate-spin text-[#8ba77f]" />
          <p className="text-lg font-medium">Verifying Session...</p>
          <p className="text-sm text-[#7a938f]">Checking authorization credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <IcDashboard />
    </div>
  );
}