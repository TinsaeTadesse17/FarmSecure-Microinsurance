'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/utils/api/user';
import { jwtDecode } from 'jwt-decode';
import { Sprout } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md border border-[#e0e7d4]"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sprout className="w-8 h-8 text-[#8ba77f]" />
          <h2 className="text-3xl font-bold text-[#3a584e]">Welcome Back</h2>
        </div>
        <p className="text-[#7a938f]">Sign in to your account</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="username" className="block text-[#7a938f] text-sm font-medium mb-2">
          Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[#7a938f]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            className="w-full pl-10 pr-4 py-3 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors"
            autoComplete="username"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-[#7a938f] text-sm font-medium mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[#7a938f]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full pl-10 pr-12 py-3 border border-[#e0e7d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-colors"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            <svg className="h-5 w-5 text-[#7a938f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showPassword ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </>
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#8ba77f] hover:bg-[#7a937f] text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8ba77f] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>

      <div className="mt-6 text-center text-sm">
        <p className="text-[#7a938f]">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#8ba77f] hover:text-[#7a937f] font-medium focus:outline-none focus:underline transition-colors"
          >
            Register
          </button>
        </p>
      </div>
    </form>
  );
}