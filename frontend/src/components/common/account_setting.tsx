'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getToken, updateUserAccount } from '@/utils/api/user';
import { X, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AccountSettingsDialog({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getCurrentUser(token)
      .then((user) => {
        setUsername(user.username);
        setUserId(user.user_id);
      })
      .catch(() => setError('Failed to fetch current user'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmUpdate = async () => {
    if (!userId) return;

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateUserAccount(userId, { username, password }, token);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowConfirmDialog(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      {/* Main Dialog */}
      {!showConfirmDialog && (
        <div className="bg-white p-6 rounded-xl w-96 shadow-lg border border-[#e0e7d4]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#3a584e]">Account Settings</h2>
            <button 
              onClick={onClose} 
              className="text-[#7a938f] hover:text-[#3a584e] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#3a584e] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 border border-[#e0e7d4] rounded-lg text-[#3a584e] focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-all"
                required
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
              />
              {password && password.length < 6 && (
                <p className="text-xs text-[#d46a1a] mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Password should be at least 6 characters
                </p>
              )}
            </div>

            {password && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#3a584e] mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 border border-[#e0e7d4] rounded-lg text-[#3a584e] focus:ring-2 focus:ring-[#8ba77f] focus:border-[#8ba77f] transition-all"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-[#fee2e2] border-l-4 border-[#dc2626] rounded text-sm text-[#7a938f] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-[#eef4e5] border-l-4 border-[#8ba77f] rounded text-sm text-[#3a584e] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8ba77f]" />
                Account updated successfully!
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-[#f9f8f3] text-[#3a584e] hover:bg-[#e0e7d4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !!(password && password !== confirmPassword)}
                className={`px-4 py-2.5 rounded-lg text-white transition-colors ${
                  loading || (password && password !== confirmPassword)
                    ? 'bg-[#8ba77f]/70 cursor-not-allowed'
                    : 'bg-[#8ba77f] hover:bg-[#7a937f]'
                }`}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="bg-white p-6 rounded-xl w-96 shadow-lg border border-[#e0e7d4]">
          <h3 className="text-lg font-semibold text-[#3a584e] mb-3">Confirm Changes</h3>
          <p className="text-[#7a938f] mb-6">Are you sure you want to update your account information?</p>

          {success ? (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-lg bg-[#8ba77f] text-white hover:bg-[#7a937f] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2.5 rounded-lg bg-[#f9f8f3] text-[#3a584e] hover:bg-[#e0e7d4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                disabled={loading}
                className={`px-4 py-2.5 rounded-lg text-white transition-colors ${
                  loading ? 'bg-[#8ba77f]/70 cursor-not-allowed' : 'bg-[#8ba77f] hover:bg-[#7a937f]'
                }`}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}