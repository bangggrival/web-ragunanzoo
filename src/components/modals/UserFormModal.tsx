import { useState, useEffect } from 'react';
import { X, User, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { MANAGER_PAGES } from '@/hooks/useUserPermissions';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

const BACKEND_URL = '';

// Validation schemas
const createUserSchema = z.object({
  name: z.string().max(100, 'Nama terlalu panjang').optional(),
  username: z.string()
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(100, 'Username terlalu panjang')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore (_)'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password terlalu panjang'),
});

const updatePasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password terlalu panjang'),
});

const sanitizeText = (text: string): string => {
  return text.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim();
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editUser?: {
    id: string;
    email?: string;
    username?: string;
    name: string | null;
    role: 'visitor' | 'staff' | 'admin';
    denied_permissions?: string[];
  } | null;
}

function getToken() {
  return localStorage.getItem('sb-token') || '';
}

export default function UserFormModal({ isOpen, onClose, onSuccess, editUser }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [role, setRole] = useState<'visitor' | 'staff' | 'admin'>('staff');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Initialize permissions with all enabled
  useEffect(() => {
    const defaultPerms: Record<string, boolean> = {};
    MANAGER_PAGES.forEach(page => {
      defaultPerms[page.key] = true;
    });
    setPermissions(defaultPerms);
  }, []);

  // Load existing user data when editing
  useEffect(() => {
    if (editUser) {
      setName(editUser.name || '');
      const uname = editUser.username || editUser.email?.split('@')[0] || '';
      setUsername(uname.replace('@ragunan.local', ''));
      setRole(editUser.role);
      loadUserPermissions(editUser.id);
    } else {
      resetForm();
    }
  }, [editUser]);

  const loadUserPermissions = async (userId: string) => {
    setLoadingPermissions(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/db`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'user_permissions',
          action: 'select',
          selects: 'permission_key,is_allowed',
          filters: [{ type: 'eq', column: 'user_id', value: userId }],
        }),
      });
      const result = await response.json();

      // Start with all enabled
      const perms: Record<string, boolean> = {};
      MANAGER_PAGES.forEach(page => {
        perms[page.key] = true;
      });

      // Apply stored permissions (denied ones)
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((perm: any) => {
          perms[perm.permission_key] = perm.is_allowed;
        });
      }

      setPermissions(perms);
    } catch (err) {
      console.error('Error loading permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setNewPassword('');
    setRole('staff');
    const defaultPerms: Record<string, boolean> = {};
    MANAGER_PAGES.forEach(page => {
      defaultPerms[page.key] = true;
    });
    setPermissions(defaultPerms);
  };

  const handleChangePassword = async () => {
    if (!editUser || !newPassword) return;
    
    const validation = updatePasswordSchema.safeParse({ password: newPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/functions/admin-update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: editUser.id, newPassword }),
      });
      const result = await response.json();

      if (result.error) {
        toast.error(result.error || 'Gagal mengubah password');
      } else {
        toast.success('Password berhasil diubah');
        setNewPassword('');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Gagal mengubah password');
    }
    setChangingPassword(false);
  };

  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAllPermissions = () => {
    const allPerms: Record<string, boolean> = {};
    MANAGER_PAGES.forEach(page => {
      allPerms[page.key] = true;
    });
    setPermissions(allPerms);
  };

  const deselectAllPermissions = () => {
    const noPerms: Record<string, boolean> = {};
    MANAGER_PAGES.forEach(page => {
      noPerms[page.key] = false;
    });
    setPermissions(noPerms);
  };

  const savePermissions = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });
      const result = await response.json();
      if (result.error) {
        console.error('Error saving permissions:', result.error);
        toast.error('Gagal menyimpan permissions');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Gagal menyimpan permissions');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editUser) {
        // Update role via dedicated endpoint
        const roleResponse = await fetch(`${BACKEND_URL}/api/admin/users/${editUser.id}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role }),
        });
        const roleResult = await roleResponse.json();

        if (roleResult.error) {
          toast.error('Gagal mengubah role: ' + roleResult.error);
          setLoading(false);
          return;
        }

        // Update profile name via dedicated endpoint
        const profileResponse = await fetch(`${BACKEND_URL}/api/admin/users/${editUser.id}/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        });
        const profileResult = await profileResponse.json();
        if (profileResult.error) {
          console.error('Error updating profile:', profileResult.error);
        }

        // Save permissions
        await savePermissions(editUser.id);

        toast.success('User berhasil diperbarui');
        onSuccess();
      } else {
        // Create new user using admin endpoint to avoid mutating the local admin session
        const validation = createUserSchema.safeParse({ 
          name: name || undefined, 
          username, 
          password 
        });
        
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const sanitizedName = name ? sanitizeText(name) : null;

        const response = await fetch(`${BACKEND_URL}/api/functions/admin-create-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: `${username}@ragunan.local`,
            password,
            name: sanitizedName,
            role,
            permissions,
          }),
        });
        const result = await response.json();

        if (result.error) {
          const errMsg = result.error || '';
          if (errMsg.includes('already') || errMsg.includes('exists')) {
            toast.error('Username sudah terdaftar');
          } else {
            toast.error(errMsg || 'Gagal membuat user');
          }
          setLoading(false);
          return;
        }

        // Save permissions for newly created user
        // Note: the backend `/api/functions/admin-create-user` handles permission insertion as well,
        // but just in case we need to overwrite:
        if (result.data?.user?.id) {
          await savePermissions(result.data.user.id);
        }

        toast.success('User berhasil dibuat');
        resetForm();
        onSuccess();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Terjadi kesalahan');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const displayUsername = editUser
    ? (editUser.username || editUser.email?.split('@')[0] || '').replace('@ragunan.local', '')
    : username;

  const isStaffOrAdmin = role === 'staff' || role === 'admin';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative z-50 flex flex-col overflow-hidden w-full max-w-xl bg-white/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 rounded-[1.25rem] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),_0_24px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 fade-in duration-300"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ===== HEADER ===== */}
        <div className="manager-modal-header shrink-0">
          <div className="manager-modal-title">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-tight">
                {editUser ? 'Edit Pengguna' : 'Tambah User Baru'}
              </p>
              {editUser && displayUsername && (
                <p className="text-[0.7rem] text-muted-foreground font-normal mt-0.5">
                  @{displayUsername}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ===== FORM BODY ===== */}
        <form onSubmit={handleSubmit} className="manager-modal-body min-h-0 !block space-y-5 overflow-y-auto">

          {/* Card: Informasi Dasar */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <User className="w-3 h-3" />
              Informasi Dasar
            </p>

            <div className="grid grid-cols-1 gap-4">
              {/* Nama */}
              <div>
                <label className="manager-input-label">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="manager-input pl-9"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="manager-input-label">
                  Username <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-medium pointer-events-none select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="contoh_username"
                    disabled={!!editUser}
                    className="manager-input pl-8"
                    required
                  />
                </div>
                {editUser && (
                  <p className="manager-input-hint">Username tidak dapat diubah setelah dibuat.</p>
                )}
              </div>
            </div>

            {/* Password (only for new user) */}
            {!editUser && (
              <div>
                <label className="manager-input-label">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="manager-input pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="manager-input-hint">Gunakan kombinasi huruf, angka, dan simbol agar lebih aman.</p>
              </div>
            )}

            {/* Change Password for existing user */}
            {editUser && (
              <div className="mt-4">
                <label className="manager-input-label">Ubah Password</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password baru (min. 6 karakter)"
                      className="manager-input pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={!newPassword || changingPassword}
                    className="h-11 px-4 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {changingPassword ? 'Mengubah...' : 'Ubah'}
                  </button>
                </div>
                <p className="manager-input-hint">Kosongkan jika tidak ingin mengubah password.</p>
              </div>
            )}
          </div>

          {/* Card: Role */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <Shield className="w-3 h-3" />
              Hak Akses
            </p>

            <div>
              <label className="manager-input-label">Role <span className="text-destructive">*</span></label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="manager-input-hint font-normal mt-2">
                <strong>Admin</strong> memiliki akses penuh. <strong>Staff</strong> memiliki akses sesuai pengaturan.
              </p>
            </div>

            {/* Admin info banner */}
            {role === 'admin' && (
              <div className="flex items-start gap-3 p-3 bg-secondary/8 border border-secondary/25 rounded-xl mt-1">
                <Shield className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  Admin memiliki akses penuh ke seluruh fitur dashboard secara otomatis.
                </p>
              </div>
            )}
          </div>

          {/* Card: Permissions — only for staff */}
          {isStaffOrAdmin && role !== 'admin' && (
            <div className="manager-form-section">
              <div className="flex items-center justify-between">
                <p className="manager-form-section-title mb-0">
                  <Shield className="w-3 h-3" />
                  Akses Halaman
                </p>
                <div className="flex gap-3 pb-2.5">
                  <button type="button" onClick={selectAllPermissions} className="text-[0.72rem] font-semibold text-primary hover:text-primary/80 transition-colors">
                    Pilih Semua
                  </button>
                  <span className="text-border">|</span>
                  <button type="button" onClick={deselectAllPermissions} className="text-[0.72rem] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Hapus Semua
                  </button>
                </div>
              </div>

              {loadingPermissions ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Memuat daftar halaman...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MANAGER_PAGES.map((page) => (
                    <label
                      key={page.key}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 group ${
                        permissions[page.key]
                          ? 'bg-primary/5 border-primary/30 shadow-sm'
                          : 'bg-white border-border/50 hover:border-primary/20 hover:bg-muted/30'
                      }`}
                    >
                      <Checkbox
                        id={`modal-perm-${page.key}`}
                        checked={!!permissions[page.key]}
                        onCheckedChange={() => togglePermission(page.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={`flex-1 text-xs font-medium leading-tight truncate ${permissions[page.key] ? 'text-primary' : 'text-foreground/70'}`}>
                        {page.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* ===== FOOTER ===== */}
        <div className="manager-modal-footer">
          <button type="button" onClick={onClose} className="manager-btn-secondary">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading} className="manager-btn-primary">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : editUser ? 'Simpan Perubahan' : 'Tambah User'}
          </button>
        </div>

      </div>
    </div>
  );
}
