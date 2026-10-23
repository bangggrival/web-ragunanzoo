import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrganizationMembership {
  id: string;
  name: string;
  full_name: string | null;
  logo_url: string | null;
  website_url: string | null;
  order_index: number;
  is_active: boolean;
  approval_date: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
}

const TABLE = 'organization_memberships' as any;

export function useOrganizationMemberships() {
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading: loading } = useQuery({
    queryKey: ['organization_memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('order_index');
      if (error) throw error;
      return (data || []) as unknown as OrganizationMembership[];
    },
  });

  const activeOrganizations = organizations.filter(o => o.is_active);

  const createMutation = useMutation({
    mutationFn: async (org: Partial<OrganizationMembership>) => {
      const { error } = await supabase.from(TABLE).insert(org);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_memberships'] });
      toast.success('Organisasi berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan organisasi'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrganizationMembership> & { id: string }) => {
      const { error } = await supabase.from(TABLE).update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_memberships'] });
      toast.success('Organisasi berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui organisasi'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_memberships'] });
      toast.success('Organisasi berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus organisasi'),
  });

  return {
    organizations,
    activeOrganizations,
    loading,
    createOrganization: createMutation.mutateAsync,
    updateOrganization: updateMutation.mutateAsync,
    deleteOrganization: deleteMutation.mutateAsync,
  };
}
