'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getToken, updateUserAccount } from '@/utils/api/user';
import { X, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AccountSettingsDialog({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('You need to be logged in to access account settings');
      return;
    }

    setLoading(true);
    getCurrentUser()
      .then((user) => {
        setUsername(user.username);
        setUserId(user.sub);
        setError('');
      })
      .catch(() => {
        setError('Failed to fetch your account information');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess(false);

    // Validate inputs
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Proceed with update
    try {
      setLoading(true);
      await updateUserAccount(userId, { username, password });
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg border border-[#e0e7d4] relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#7a938f] hover:text-[#3a584e] transition-colors"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-[#3a584e] mb-4">Account Settings</h2>

        {loading && !username ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="w-8 h-8 animate-spin text-[#8ba77f]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-[#fee2e2] rounded text-sm text-[#dc2626] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-[#eef4e5] rounded text-sm text-[#3a584e] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#8ba77f]" />
                <span>Account updated successfully! This dialog will close shortly.</span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#3a584e] mb-2">
                Username <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 border border-[#e0e7d4] rounded-lg text-[#3a584e] focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-all"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#3a584e] mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border border-[#e0e7d4] rounded-lg text-[#3a584e] focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-all"
                minLength={6}
                disabled={loading}
                placeholder="Leave blank to keep current password"
              />
            </div>

            {password && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#3a584e] mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 border border-[#e0e7d4] rounded-lg text-[#3a584e] focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-all"
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-[#f9f8f3] text-[#3a584e] hover:bg-[#e0e7d4] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (!!password && password !== confirmPassword)}
                className={`px-4 py-2.5 rounded-lg text-white transition-colors ${
                  loading
                    ? 'bg-[#8ba77f]/70 cursor-not-allowed'
                    : 'bg-[#8ba77f] hover:bg-[#7a937f]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Account'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}