'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/AuthForm';
import RegisterForm from '@/components/auth/Register';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-green-100 p-4">
      {showLogin ? (
        <LoginForm onSwitch={() => setShowLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setShowLogin(true)} />
      )}
    </div>
  );
}
