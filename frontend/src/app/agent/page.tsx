'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import IcDashboard from '@/components/ic/dashboard';

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
        ? decoded.role.includes('ic')
        : decoded.role === 'ic';

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
    return <div className="p-6">Loading...</div>;
  }

  return <IcDashboard />;
}
