'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser, getToken, clearToken } from '@/utils/api/user';
import { useRouter } from 'next/navigation';
import AccountSettingsDialog from '@/components/common/account_setting';
import { X, AlertTriangle, Settings, LogOut } from 'lucide-react';

export default function AvatarMenu() {
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/');
      return;
    }

    getCurrentUser()
      .then((user) => setUsername(user.username))
      .catch((err) => {
        console.error('Failed to fetch user:', err);
        clearToken();
        router.replace('/');
      });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router]);

  const confirmLogout = () => {
    clearToken();
    router.replace('/');
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        className="relative flex items-center justify-center h-10 w-10 rounded-full bg-[#8ba77f] text-white font-medium hover:bg-[#7a937f] focus:outline-none focus:ring-2 focus:ring-[#8ba77f]/50 transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="User menu"
      >
        {username.charAt(0).toUpperCase() || '?'}
      </button>

      {/* Dropdown menu */}
      <div
        className={`absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-[#e0e7d4] divide-y divide-[#e0e7d4] transition-all duration-200 ease-out ${
          dropdownOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {dropdownOpen && (
          <>
            <div className="px-4 py-3">
              <p className="text-sm text-[#7a938f]">Signed in as</p>
              <p className="text-sm font-medium text-[#3a584e] truncate">{username}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setDialogOpen(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-[#3a584e] hover:bg-[#f9f8f3] transition-colors gap-2"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setLogoutDialogOpen(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#fee2e2] transition-colors gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {dialogOpen && <AccountSettingsDialog onClose={() => setDialogOpen(false)} />}

      {/* Logout confirmation dialog */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-96 border border-[#e0e7d4]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-[#fee2e2] rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-[#dc2626]" />
              </div>
              <h3 className="text-xl font-semibold text-[#3a584e] mb-2">
                Confirm Logout
              </h3>
              <p className="text-[#7a938f] mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setLogoutDialogOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#f9f8f3] text-[#3a584e] hover:bg-[#e0e7d4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
