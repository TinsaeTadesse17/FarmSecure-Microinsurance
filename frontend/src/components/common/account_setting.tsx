'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getToken, updateUserAccount } from '@/utils/api/user';

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
      setTimeout(() => setShowConfirmDialog(false), 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Main Dialog */}
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl pointer-events-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Account Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              minLength={6}
            />
            {password && password.length < 6 && (
              <p className="text-xs text-yellow-600 mt-1">Password should be at least 6 characters</p>
            )}
          </div>

          {password && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          )}

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm">
              Account updated successfully!
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!(password && password !== confirmPassword)}
              className={`px-4 py-2 rounded-md text-white transition ${
                loading || (password && password !== confirmPassword)
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl pointer-events-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Changes</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to update your account information?</p>
            
            {success ? (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdate}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white transition ${
                    loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}