'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/sidebar';
import AvatarMenu from '@/components/common/avatar';
import { getIcUsers, updateUserAccount, UserOut, getToken } from '@/utils/api/user';
import { Sprout, ChevronRight, LeafyGreen, ThermometerSun, Tornado } from 'lucide-react';

interface FetchState {
  data: UserOut[];
  loading: boolean;
  error: string | null;
}

const statusOptions = ['approve', 'pending', 'reject'];

const statusColors: Record<string, { bg: string; text: string }> = {
  approve: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]' },
  pending: { bg: 'bg-[#fff3e0]', text: 'text-[#ef6c00]' },
  reject: { bg: 'bg-[#ffebee]', text: 'text-[#c62828]' },
};

const IcUsersPage: React.FC = () => {
  const [icUsers, setIcUsers] = useState<FetchState>({
    data: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchIcUsers = async () => {
      setIcUsers(prev => ({ ...prev, loading: true, error: null }));
      const token = getToken();
      if (!token) {
        setIcUsers({
          data: [],
          loading: false,
          error: 'No authentication token found. Please log in as an admin.',
        });
        return;
      }
      try {
        const data = await getIcUsers(token);
        setIcUsers({ data, loading: false, error: null });
      } catch (error) {
        setIcUsers({
          data: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch IC users',
        });
      }
    };

    fetchIcUsers();
  }, []);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    const token = getToken();
    if (!token) {
      setIcUsers(prev => ({
        ...prev,
        error: 'No authentication token found. Please log in.',
      }));
      return;
    }

    const previousData = [...icUsers.data];
    setIcUsers(prev => ({
      ...prev,
      data: prev.data.map(user =>
        user.user_id === userId ? { ...user, status: newStatus } : user
      ),
    }));

    try {
      await updateUserAccount(userId, { status: newStatus }, token);
    } catch (error) {
      setIcUsers(prev => ({
        ...prev,
        data: previousData,
        error: error instanceof Error ? error.message : 'Failed to update status',
      }));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#3a584e]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sprout className="w-8 h-8 text-[#8ba77f]" />
              User Management
              <span className="ml-2 text-sm font-normal bg-[#eef4e5] px-3 py-1 rounded-full">
                IC Members
              </span>
            </h1>
            <p className="mt-2 text-[#7a938f]">
              Manage investment club member status and permissions
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(163,177,138,0.15)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <LeafyGreen className="w-5 h-5 text-[#8ba77f]" />
                Member Directory
              </h2>
              <div className="text-sm bg-[#f5f3eb] px-3 py-1 rounded-full">
                {icUsers.data.length} {icUsers.data.length === 1 ? 'member' : 'members'}
              </div>
            </div>

            {icUsers.loading && (
              <div className="flex justify-center py-8">
                <div className="animate-pulse flex items-center gap-2">
                  <ThermometerSun className="w-6 h-6 text-[#8ba77f] animate-spin-slow" />
                  <span className="text-[#7a938f]">Growing members list...</span>
                </div>
              </div>
            )}

            {icUsers.error && (
              <div className="bg-[#ffebee] p-4 rounded-xl border border-[#ffcdd2] mb-6">
                <div className="flex items-center gap-3">
                  <Tornado className="w-5 h-5 text-[#c62828]" />
                  <div>
                    <p className="text-sm text-[#c62828]">{icUsers.error}</p>
                  </div>
                </div>
              </div>
            )}

            {!icUsers.loading && !icUsers.error && icUsers.data.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 p-4 w-fit bg-[#f5f3eb] rounded-full">
                  <Sprout className="h-12 w-12 text-[#7a938f]" />
                </div>
                <h3 className="text-lg font-medium text-[#3a584e]">No members found</h3>
                <p className="mt-2 text-sm text-[#7a938f] max-w-md mx-auto">
                  It seems no investment club members have sprouted yet. Check back later or invite new members.
                </p>
              </div>
            )}

            {!icUsers.loading && !icUsers.error && icUsers.data.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-[#e0e7d4]">
                <table className="w-full">
                  <thead className="bg-[#f5f3eb]">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-[#5a736e]">
                        Member
                      </th>
                      <th className="px-6 py-4 text-left font-medium text-[#5a736e]">
                        Account Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {icUsers.data.map((user) => (
                      <tr 
                        key={user.user_id} 
                        className="border-t border-[#e0e7d4] hover:bg-[#f9f8f3] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                              ${statusColors[user.status].bg} ${statusColors[user.status].text}`}>
                              <span className="font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-[#3a584e]">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <select
                              value={user.status}
                              onChange={e => handleStatusChange(user.user_id, e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border appearance-none focus:outline-none focus:ring-2 ${
                                statusColors[user.status].bg
                              } ${
                                statusColors[user.status].text
                              } border-transparent focus:ring-[#8ba77f] focus:border-[#8ba77f]`}
                            >
                              {statusOptions.map(option => (
                                <option key={option} value={option}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                              ))}
                            </select>
                            <ChevronRight className="w-4 h-4 absolute right-3 top-3 transform rotate-90 pointer-events-none text-current" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IcUsersPage;
