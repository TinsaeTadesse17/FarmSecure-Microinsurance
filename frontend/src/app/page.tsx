'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/AuthForm';
import RegisterForm from '@/components/auth/Register';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
        <div className="flex items-center justify-center min-h-screen bg-[#f9f8f3] text-[#2c423f] p-4">
      {showLogin ? (
        <LoginForm onSwitch={() => setShowLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setShowLogin(true)} />
      )}
    </div>
  );
}
