import { useState, useEffect } from 'react';
import { Check, Lock, ChevronDown, ExternalLink, Settings2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MANAGER_PAGES } from '@/hooks/useUserPermissions';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserAccessPopoverProps {
  userId: string;
  userName: string;
  role: 'visitor' | 'staff' | 'admin';
  deniedPermissions: string[];
  permissionsCount: number;
  isAdmin: boolean;
  onPermissionsUpdated: () => void;
}

export default function UserAccessPopover({
  userId,
  userName,
  role,
  deniedPermissions,
  permissionsCount,
  isAdmin,
  onPermissionsUpdated,
}: UserAccessPopoverProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize permissions when popover opens
  useEffect(() => {
    if (isOpen) {
      const perms: Record<string, boolean> = {};
      MANAGER_PAGES.forEach(page => {
        perms[page.key] = !deniedPermissions.includes(page.key);
      });
      setPermissions(perms);
      setHasChanges(false);
    }
  }, [isOpen, deniedPermissions]);

  const togglePermission = (key: string) => {
    setPermissions(prev => {
      const newPerms = { ...prev, [key]: !prev[key] };
      
      // Check if there are changes compared to original
      const originalPerms: Record<string, boolean> = {};
      MANAGER_PAGES.forEach(page => {
        originalPerms[page.key] = !deniedPermissions.includes(page.key);
      });
      
      const changed = Object.keys(newPerms).some(k => newPerms[k] !== originalPerms[k]);
      setHasChanges(changed);
      
      return newPerms;
    });
  };

  const selectAll = () => {
    const allPerms: Record<string, boolean> = {};
    MANAGER_PAGES.forEach(page => {
      allPerms[page.key] = true;
    });
    setPermissions(allPerms);
    setHasChanges(true);
  };

  const deselectAll = () => {
    const noPerms: Record<string, boolean> = {};
    MANAGER_PAGES.forEach(page => {
      noPerms[page.key] = false;
    });
    setPermissions(noPerms);
    setHasChanges(true);
  };

  const savePermissions = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('sb-token') || '';
      const BACKEND_URL = '';
      
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Akses halaman berhasil diperbarui');
      setHasChanges(false);
      setIsOpen(false);
      onPermissionsUpdated();
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Gagal menyimpan akses halaman');
    }
    
    setSaving(false);
  };

  // Admin role - full access
  if (role === 'admin') {
    return (
      <div className="flex items-center gap-1">
        <Check className="w-3 h-3 text-primary" />
        <span className="text-xs text-muted-foreground">Akses Penuh</span>
      </div>
    );
  }

  // Visitor role - no access needed
  if (role === 'visitor') {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  // Staff role - show editable popover
  const allowedCount = MANAGER_PAGES.length - permissionsCount;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 text-left hover:bg-muted/50 px-2 py-1 rounded-md transition-colors">
          {permissionsCount > 0 ? (
            <>
              <Lock className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive font-medium">
                {permissionsCount} dibatasi
              </span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Akses Penuh</span>
            </>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0" sideOffset={5}>
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Akses Halaman</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {userName} • {allowedCount}/{MANAGER_PAGES.length} halaman aktif
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/10">
            <span className="text-xs text-muted-foreground">Pilih Cepat:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                Semua
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-destructive hover:underline"
              >
                Tidak Ada
              </button>
            </div>
          </div>
        )}

        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {MANAGER_PAGES.map((page) => (
              <div
                key={page.key}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-colors ${
                  permissions[page.key] 
                    ? 'bg-primary/5 hover:bg-primary/10' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isAdmin ? (
                    <Checkbox
                      id={`perm-${page.key}`}
                      checked={permissions[page.key] || false}
                      onCheckedChange={() => togglePermission(page.key)}
                      className="shrink-0"
                    />
                  ) : (
                    permissions[page.key] ? (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-destructive/70 shrink-0" />
                    )
                  )}
                  <label
                    htmlFor={isAdmin ? `perm-${page.key}` : undefined}
                    className={`text-sm truncate ${isAdmin ? 'cursor-pointer' : ''} ${
                      permissions[page.key] ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {page.label}
                  </label>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(page.path);
                    setIsOpen(false);
                  }}
                  className="p-1.5 hover:bg-muted rounded transition-colors shrink-0 opacity-50 hover:opacity-100"
                  title={`Buka ${page.label}`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {isAdmin && (
          <div className="p-3 border-t bg-muted/10 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={savePermissions}
              disabled={saving || !hasChanges}
              className="min-w-[80px]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
