'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getToken, updateUserAccount } from '@/utils/api/user';

export default function AccountSettingsDialog({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    if (!userId) return;

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateUserAccount(userId, { username, password }, token);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-md w-96 shadow-xl pointer-events-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <label className="block mb-2 text-sm font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">Account updated successfully!</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
