'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/user';
import { jwtDecode } from 'jwt-decode';

interface LoginFormProps {
  onSwitch: () => void;
}

interface TokenPayload {
  sub: string;
  username: string;
  role: string[] | string;
  company_id: (string | null)[];
  exp: number;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { access_token } = await loginUser({ username, password });
      localStorage.setItem('token', access_token);
      const decoded = jwtDecode<TokenPayload>(access_token);
      const roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];

      if (roles.includes('admin')) {
        router.push('/admin');
      } else if (roles.includes('agent')) {
        router.push('/agent');
      } else if (roles.includes('ic')) {
        router.push('/ic');
      } else {
        throw new Error('Unauthorized role');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md font-sans"
    >
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
        Welcome User
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          placeholder="your.username"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Logging in…' : 'Login'}
      </button>

      <p className="mt-4 text-center text-gray-600 text-sm">
        Don't have an account?{' '}
        <span
          onClick={onSwitch}
          className="text-green-600 hover:underline cursor-pointer"
        >
          Register now
        </span>
      </p>
    </form>
  );
}
