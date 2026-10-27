"use client";

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPermissions, MANAGER_PAGES, PermissionKey } from '@/hooks/useUserPermissions';
import { useAuth } from '@/hooks/useAuth';
import { AppIcon } from '@/components/ui/AppIcon';

interface PermissionGuardProps {
  children: ReactNode;
  permissionKey: PermissionKey;
}

export default function PermissionGuard({ children, permissionKey }: PermissionGuardProps) {
  const router = useRouter();
  const { hasPermission, loading: permLoading } = useUserPermissions();
  const { userRole, loading: authLoading } = useAuth();

  // Wait only for auth loading (role now comes from JWT instantly)
  const isLoading = authLoading || permLoading;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Admin always has access
  if (userRole === 'admin') {
    return <>{children}</>;
  }

  // Not logged in at all — redirect to auth
  if (!userRole) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name="solar:lock-bold-duotone" className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Sesi Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">
            Silakan login terlebih dahulu untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Staff check
  if (!hasPermission(permissionKey)) {
    const pageName = MANAGER_PAGES.find(p => p.key === permissionKey)?.label || permissionKey;
    
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AppIcon name="solar:lock-bold-duotone" className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-6">
            Anda tidak memiliki izin untuk mengakses halaman <strong>{pageName}</strong>. 
            Hubungi administrator untuk mendapatkan akses.
          </p>
          <button
            onClick={() => router.push('/manager')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to get allowed pages for sidebar filtering
export function useAllowedPages() {
  const { hasPermission, loading } = useUserPermissions();
  const { userRole, loading: authLoading } = useAuth();

  const isReady = !loading && !authLoading;

  const getAllowedPages = () => {
    if (!isReady) return [];
    if (userRole === 'admin') {
      return MANAGER_PAGES.map(p => p.key);
    }
    return MANAGER_PAGES
      .filter(page => hasPermission(page.key))
      .map(p => p.key);
  };

  return {
    allowedPages: getAllowedPages(),
    loading: !isReady,
    isPageAllowed: (key: PermissionKey) => {
      if (!isReady) return false;
      if (userRole === 'admin') return true;
      return hasPermission(key);
    }
  };
}
