import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Define all available manager pages with their permission keys
export const MANAGER_PAGES = [
  { key: 'dashboard', label: 'Dashboard', path: '/manager' },
  { key: 'animals', label: 'Kelola Satwa', path: '/manager/animals' },
  { key: 'plants', label: 'Kelola Tanaman', path: '/manager/plants' },
  { key: 'categories', label: 'Kelola Kategori', path: '/manager/categories' },
  { key: 'feeding-schedules', label: 'Jadwal Makan', path: '/manager/feeding-schedules' },
  { key: 'events', label: 'Kelola Event', path: '/manager/events' },
  { key: 'trivia', label: 'Kuis Edukasi', path: '/manager/trivia' },
  { key: 'tickets', label: 'Kelola Tiket', path: '/manager/tickets' },
  { key: 'ticket-content', label: 'Halaman Tiket', path: '/manager/ticket-content' },
  { key: 'venues', label: 'Kelola Venue', path: '/manager/venues' },
  { key: 'news', label: 'Kelola Berita', path: '/manager/news' },
  { key: 'announcements', label: 'Kelola Pengumuman', path: '/manager/announcements' },
  { key: 'users', label: 'Manajemen Pengguna', path: '/manager/users' },
  { key: 'branding', label: 'Branding', path: '/manager/branding' },
  { key: 'map', label: 'Kelola Peta', path: '/manager/map' },
  { key: 'map-markers', label: 'Marker Peta', path: '/manager/map-markers' },
  { key: 'gps-map', label: 'Peta GPS Interaktif', path: '/manager/gps-map' },
  { key: 'hero-banner', label: 'Hero Banner', path: '/manager/hero-banner' },
  { key: 'floating-button', label: 'Floating Button', path: '/manager/floating-button' },
  { key: 'system-configs', label: 'Pengaturan Sistem', path: '/manager/system-configs' },
  { key: 'explorer-navbar', label: 'Navbar Explorer', path: '/manager/explorer-navbar' },
  { key: 'custom-pages', label: 'Halaman Kustom', path: '/manager/custom-pages' },
  { key: 'history', label: 'Sejarah', path: '/manager/history' },
  { key: 'visitor-stats', label: 'Statistik Pengunjung', path: '/manager/visitor-stats' },
  { key: 'website-analytics', label: 'Analytics Website', path: '/manager/website-analytics' },
  { key: 'whatsapp-templates', label: 'Template WhatsApp', path: '/manager/whatsapp-templates' },
  { key: 'whats-new', label: 'Yang Terbaru', path: '/manager/whats-new' },
  { key: 'gallery', label: 'Galeri Media', path: '/manager/gallery' },
  { key: 'wbs', label: 'WBS', path: '/manager/wbs' },
  { key: 'service-registrations', label: 'Pendaftaran PKL', path: '/manager/service-registrations' },
  { key: 'service-standards', label: 'Standar Pelayanan', path: '/manager/service-standards' },
  { key: 'service-settings', label: 'Pengaturan Layanan', path: '/manager/service-settings' },
  { key: 'service-availability', label: 'Ketersediaan Jadwal', path: '/manager/service-availability' },
  { key: 'tour-guides', label: 'Pemandu Wisata', path: '/manager/tour-guides' },
  { key: 'library', label: 'Perpustakaan Digital', path: '/manager/library' },
  { key: 'chatbot-faqs', label: 'FAQ Chatbot', path: '/manager/chatbot-faqs' },
  { key: 'jdih', label: 'JDIH', path: '/manager/jdih' },
  { key: 'organizations', label: 'Keanggotaan Organisasi', path: '/manager/organizations' },
  { key: 'facility-reports', label: 'Lapor Fasilitas', path: '/manager/facility-reports' },
] as const;

export type PermissionKey = typeof MANAGER_PAGES[number]['key'];

export interface UserPermission {
  id: string;
  user_id: string;
  permission_key: string;
  is_allowed: boolean;
}

export function useUserPermissions(userId?: string) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user, userRole, loading: authLoading } = useAuth();

  const targetUserId = userId || user?.id;

  const fetchPermissions = useCallback(async () => {
    // Wait for auth to complete first
    if (authLoading) {
      return;
    }

    if (!targetUserId) {
      // Initialize default permissions even without user
      const permMap: Record<string, boolean> = {};
      MANAGER_PAGES.forEach(page => {
        permMap[page.key] = true;
      });
      setPermissions(permMap);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_key, is_allowed')
        .eq('user_id', targetUserId);

      if (error) {
        console.error('Error fetching permissions:', error);
        // Still set default permissions on error
        const permMap: Record<string, boolean> = {};
        MANAGER_PAGES.forEach(page => {
          permMap[page.key] = true;
        });
        setPermissions(permMap);
        setLoading(false);
        return;
      }

      // Build permissions map with defaults - all true by default
      const permMap: Record<string, boolean> = {};
      MANAGER_PAGES.forEach(page => {
        permMap[page.key] = true;
      });

      // Override with actual denied permissions from DB
      data?.forEach(perm => {
        permMap[perm.permission_key] = perm.is_allowed;
      });

      setPermissions(permMap);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, authLoading]);

  // Fetch permissions when auth is ready and user changes
  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [fetchPermissions, authLoading]);

  const hasPermission = useCallback((key: PermissionKey): boolean => {
    // Admin has all permissions
    if (userRole === 'admin') return true;
    
    // For staff/visitor, check permissions map
    return permissions[key] ?? true;
  }, [permissions, userRole]);

  const updatePermissions = async (
    targetId: string, 
    newPermissions: Record<string, boolean>
  ): Promise<{ error: any }> => {
    try {
      // Delete existing permissions for the user
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', targetId);

      // Insert new permissions (only store denied ones)
      const permissionsToInsert = Object.entries(newPermissions)
        .filter(([_, isAllowed]) => !isAllowed)
        .map(([key, isAllowed]) => ({
          user_id: targetId,
          permission_key: key,
          is_allowed: isAllowed,
        }));

      if (permissionsToInsert.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionsToInsert);

        if (error) return { error };
      }

      await fetchPermissions();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  return {
    permissions,
    loading: loading || authLoading,
    hasPermission,
    updatePermissions,
    refetch: fetchPermissions,
    MANAGER_PAGES,
  };
}
