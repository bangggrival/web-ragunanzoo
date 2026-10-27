"use client";

import { AppIcon } from '@/components/ui/AppIcon';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import UserFormModal from '@/components/modals/UserFormModal';
import { usePagination, TablePagination } from '@/components/ui/TablePagination';
import UserAccessPopover from '@/components/users/UserAccessPopover';
import { useConfirm } from '@/hooks/useConfirm';

const BACKEND_URL = '';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('sb-token') || '';
}

export interface UserWithRole {
  id: string;
  email?: string;
  username?: string;
  name: string | null;
  role: 'visitor' | 'staff' | 'admin';
  created_at: string;
  permissions_count?: number;
  denied_permissions?: string[];
}

export default function ManageUsersClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'visitor'>('all');
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const { userRole } = useAuth();
  const { confirm, ConfirmComponent } = useConfirm();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.data) {
        setUsers(result.data as UserWithRole[]);
      } else if (result.error) {
        toast.error('Gagal memuat daftar pengguna: ' + result.error);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Gagal memuat daftar pengguna');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: 'visitor' | 'staff' | 'admin') => {
    if (userRole !== 'admin') { toast.error('Hanya admin yang dapat mengubah role'); return; }
    
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await response.json();
      if (result.error) {
        toast.error('Gagal mengubah role: ' + result.error);
        fetchUsers(); // Revert
      } else {
        toast.success('Role berhasil diubah');
      }
    } catch (err) {
      toast.error('Gagal mengubah role');
      fetchUsers(); // Revert
    }
  };

  const handleEditUser = (user: UserWithRole) => { setEditingUser(user); setIsModalOpen(true); };
  const handleAddUser = () => { setEditingUser(null); setIsModalOpen(true); };

  const handleDeleteClick = async (user: UserWithRole) => {
    if (userRole !== 'admin') {
      toast.error('Hanya admin yang dapat menghapus akun');
      return;
    }
    
    if (await confirm('Hapus Akun Pengguna', `Apakah Anda yakin ingin menghapus akun ${user.name || user.username}? Semua data yang terkait dengan akun ini akan dihapus secara permanen dan tidak dapat dikembalikan.`)) {
      await confirmDeleteUser(user);
    }
  };

  const confirmDeleteUser = async (user: UserWithRole) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      if (result.error) {
        toast.error('Gagal menghapus akun: ' + result.error);
      } else {
        toast.success('Akun berhasil dihapus');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Gagal menghapus akun');
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh the user list
  };

  const filteredUsers = users.filter(user => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchSearch = !query || (
      (user.name || '').toLowerCase().includes(query) ||
      (user.username || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query)
    );
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const { currentPage, pageSize, totalPages, totalItems, paginatedItems, handlePageChange, handlePageSizeChange } =
    usePagination(filteredUsers, 10);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_2px_10px_-3px_rgba(225,29,72,0.6)] border-none';
      case 'staff': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-[0_2px_10px_-3px_rgba(16,185,129,0.6)] border-none';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) { case 'admin': return 'Admin'; case 'staff': return 'Staff'; default: return 'Visitor'; }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const visitorCount = users.filter(u => u.role === 'visitor').length;

  const avatarColors = [
    'bg-primary/10 text-primary',
    'bg-blue-50 text-blue-600',
    'bg-purple-50 text-purple-600',
    'bg-orange-50 text-orange-600',
    'bg-teal-50 text-teal-600',
  ];

  const getDisplayName = (user: UserWithRole) => {
    return user.name || user.username || user.email?.split('@')[0] || 'Unknown';
  };

  const getUsername = (user: UserWithRole) => {
    return (user.username || user.email || 'unknown').replace('@ragunan.local', '');
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm p-8">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Kelola role dan akses pengguna sistem</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh"
          >
            <AppIcon icon="RefreshCw" className="w-4 h-4 text-slate-500" />
          </button>
          {userRole === 'admin' && (
            <button
              onClick={handleAddUser}
              className="group relative inline-flex items-center gap-2.5 h-11 px-6 text-sm font-bold rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.5)] border border-green-400/20"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <AppIcon icon="Plus" className="w-4 h-4 relative z-10 transition-transform group-hover:rotate-90 duration-300" />
              <span className="relative z-10">Tambah User</span>
            </button>
          )}
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pengguna', value: users.length, textClass: 'text-slate-700', iconColor: 'text-slate-600', iconBg: 'bg-slate-100', icon: (props: any) => <AppIcon icon="Users" {...props} />, shadow: 'hover:shadow-slate-200' },
          { label: 'Admin', value: adminCount, textClass: 'text-rose-700', iconColor: 'text-rose-600', iconBg: 'bg-rose-100', icon: (props: any) => <AppIcon icon="Shield" {...props} />, shadow: 'hover:shadow-rose-200' },
          { label: 'Staff', value: staffCount, textClass: 'text-green-700', iconColor: 'text-green-600', iconBg: 'bg-green-100', icon: (props: any) => <AppIcon icon="UserCheck" {...props} />, shadow: 'hover:shadow-green-200' },
          { label: 'Visitor', value: visitorCount, textClass: 'text-blue-700', iconColor: 'text-blue-600', iconBg: 'bg-blue-100', icon: (props: any) => <AppIcon icon="UserX" {...props} />, shadow: 'hover:shadow-blue-200' }
        ].map((stat) => {
          const Icon = stat.icon as any;
          return (
            <div 
              key={stat.label} 
              className={`relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-[1.25rem] border border-white/60 p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] ${stat.shadow}`}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-white/40 to-white/0 rounded-full blur-2xl pointer-events-none" />
              <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="relative z-10">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.textClass} leading-tight mt-0.5`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== ADMIN NOTICE ===== */}
      {userRole !== 'admin' && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex items-center gap-3">
          <AppIcon icon="Shield" className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">Hanya admin yang dapat mengubah role dan permission pengguna.</p>
        </div>
      )}

      {/* ===== SEARCH & FILTER ===== */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <AppIcon icon="Search" className="w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Ketik nama atau username untuk mencari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-400 transition-all shadow-sm hover:shadow-md"
          />
        </div>
        <div className="relative w-full sm:w-64 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <AppIcon icon="Shield" className="w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full h-14 pl-12 pr-10 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-400 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 1.25rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em',
            }}
          >
            <option value="all">Menampilkan Semua Role</option>
            <option value="admin">Hanya Admin</option>
            <option value="staff">Hanya Staff</option>
            <option value="visitor">Hanya Visitor</option>
          </select>
        </div>
      </div>

      {/* ===== USERS TABLE ===== */}
      <div className="manager-table-shell">
        {filteredUsers.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="relative w-24 h-24 mx-auto mb-6 group">
              <div className="absolute inset-0 bg-slate-100 rounded-[2rem] rotate-6 group-hover:rotate-12 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-50 rounded-[2rem] -rotate-3 border border-slate-200 flex items-center justify-center shadow-sm">
                <AppIcon icon="UserX" className="w-10 h-10 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery 
                ? 'Kami tidak dapat menemukan pengguna yang cocok dengan kata kunci yang Anda masukkan.' 
                : 'Sistem saat ini belum memiliki pengguna terdaftar.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block manager-table-scroll">
              <table className="manager-table">
                <thead className="manager-table-head">
                  <tr>
                    <th className="manager-table-th rounded-tl-[1rem]">Pengguna</th>
                    <th className="manager-table-th hidden lg:table-cell">Username</th>
                    <th className="manager-table-th">Role</th>
                    <th className="manager-table-th hidden xl:table-cell">Akses Halaman</th>
                    <th className="manager-table-th hidden xl:table-cell">Bergabung</th>
                    {userRole === 'admin' && (
                      <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Tindakan</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {paginatedItems.map((user, idx) => (
                    <tr key={user.id} className="manager-table-row">
                      {/* Pengguna */}
                      <td className="manager-table-td">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-sm ${avatarColors[idx % avatarColors.length]}`}>
                            {getDisplayName(user).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">{getDisplayName(user)}</p>
                            <p className="text-xs text-slate-500 font-mono bg-slate-100/80 px-2 py-0.5 rounded-md mt-1 lg:hidden w-fit">@{getUsername(user)}</p>
                          </div>
                        </div>
                      </td>
                      {/* Username */}
                      <td className="manager-table-td hidden lg:table-cell">
                        <span className="text-sm text-slate-500 font-mono bg-slate-100/80 px-2 py-1 rounded-lg">@{getUsername(user)}</span>
                      </td>
                      {/* Role */}
                      <td className="manager-table-td">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${getRoleBadge(user.role)}`}>
                          <AppIcon icon="Shield" className="w-3.5 h-3.5" />
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      {/* Akses */}
                      <td className="manager-table-td hidden xl:table-cell">
                        <UserAccessPopover
                          userId={user.id}
                          userName={getDisplayName(user)}
                          role={user.role}
                          deniedPermissions={user.denied_permissions || []}
                          permissionsCount={Number(user.permissions_count) || 0}
                          isAdmin={userRole === 'admin'}
                          onPermissionsUpdated={fetchUsers}
                        />
                      </td>
                      {/* Bergabung */}
                      <td className="manager-table-td hidden xl:table-cell">
                        <span className="text-sm text-slate-500 font-medium">{formatDate(user.created_at)}</span>
                      </td>
                      {/* Aksi */}
                      {userRole === 'admin' && (
                        <td className="manager-table-td manager-table-td-right">
                          <div className="manager-table-actions">
                            <div className="relative">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                className="h-9 pl-4 pr-9 text-xs font-bold rounded-[1rem] border border-slate-200 bg-slate-50/50 text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-400 transition-all hover:bg-white hover:shadow-sm"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                  backgroundPosition: 'right 0.5rem center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '1.2em 1.2em',
                                }}
                              >
                                <option value="visitor">Visitor</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="w-9 h-9 flex items-center justify-center rounded-[1rem] bg-white border border-slate-200 hover:bg-green-50 hover:border-green-200 transition-all shadow-sm hover:shadow-md group/btn"
                              title="Edit Detail & Akses"
                            >
                              <AppIcon icon="Edit2" className="w-4 h-4 text-slate-400 group-hover/btn:text-green-500 transition-colors" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="w-9 h-9 flex items-center justify-center rounded-[1rem] bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm hover:shadow-md group/btn"
                              title="Hapus Akun"
                            >
                              <AppIcon icon="Trash2" className="w-4 h-4 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Fallback View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedItems.map((user, idx) => (
                <div key={user.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-sm ${avatarColors[idx % avatarColors.length]}`}>
                      {getDisplayName(user).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-slate-800 truncate">{getDisplayName(user)}</p>
                      <p className="text-xs text-slate-500 font-mono mb-2">@{getUsername(user)}</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm ${getRoleBadge(user.role)}`}>
                        <AppIcon icon="Shield" className="w-3 h-3" />
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                  
                  {userRole === 'admin' && (
                    <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100/80">
                      <div className="relative flex-1">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          className="w-full h-10 pl-4 pr-9 text-sm font-bold rounded-[1rem] border border-slate-200 bg-slate-50/50 text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-400 transition-all hover:bg-white hover:shadow-sm"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.75rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.2em 1.2em',
                          }}
                        >
                          <option value="visitor">Visitor</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="h-10 px-4 flex items-center justify-center gap-2 rounded-[1rem] bg-white border border-slate-200 hover:bg-green-50 hover:border-green-200 transition-all shadow-sm hover:shadow-md text-slate-600 font-semibold text-sm"
                      >
                        <AppIcon icon="Edit2" className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="h-10 px-4 flex items-center justify-center gap-2 rounded-[1rem] bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm hover:shadow-md text-slate-600 font-semibold text-sm text-rose-600 hover:text-rose-700"
                        title="Hapus Akun"
                      >
                        <AppIcon icon="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="pt-4 mt-2 border-t border-slate-200/50">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Modals & Dialogs */}
    <UserFormModal
      isOpen={isModalOpen}
      onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
      editUser={editingUser}
      onSuccess={handleSuccess}
    />

    {ConfirmComponent}
  </>
);
}
