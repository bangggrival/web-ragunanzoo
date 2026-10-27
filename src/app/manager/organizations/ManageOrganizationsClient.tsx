"use client";

import { useState, useRef, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OrganizationMembership } from '@/hooks/useOrganizationMemberships';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { deleteOrganizationAction, upsertOrganizationAction } from './actions';
import { Badge } from '@/components/ui/badge';

const emptyForm = {
  name: '',
  full_name: '',
  logo_url: '',
  website_url: '',
  order_index: 0,
  is_active: true,
};

export default function ManageOrganizationsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrganizationMembership | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('organization_memberships').select('*').order('order_index', { ascending: true });
        if (data) setOrganizations(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'organization_memberships') fetchData();
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
  }, []);

  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order_index: organizations.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (org: OrganizationMembership) => {
    setEditing(org);
    setForm({
      name: org.name,
      full_name: org.full_name || '',
      logo_url: org.logo_url || '',
      website_url: org.website_url || '',
      order_index: org.order_index,
      is_active: org.is_active,
    });
    setModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const path = `logos/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('org-logos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('org-logos').getPublicUrl(data.path);
      setForm(f => ({ ...f, logo_url: publicUrl }));
      toast.success('Logo berhasil diupload');
    } catch {
      toast.error('Gagal mengupload logo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nama organisasi wajib diisi');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id: editing?.id,
        ...form
      };
      
      const result = await upsertOrganizationAction(payload);
      if (!result.success) throw new Error(result.error);
      
      toast.success(editing ? 'Organisasi berhasil diperbarui' : 'Organisasi berhasil ditambahkan');
      setModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (org: OrganizationMembership) => {
    if (!(await confirm("Konfirmasi", `Hapus organisasi "${org.name}"?`))) return;
    try {
      const result = await deleteOrganizationAction(org.id);
      if (!result.success) throw new Error(result.error);
      
      setOrganizations(prev => prev.filter(o => o.id !== org.id));
      toast.success('Organisasi berhasil dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const handleTogglePublish = async (id: string, is_published: boolean) => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_published } : o));
    try {
      const { error } = await supabase.from('organization_memberships').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success('Status tampil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_published: !is_published } : o));
    }
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
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="LayoutTemplate" className="w-5 h-5 text-green-500" />
            </div>
            Keanggotaan Organisasi
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola logo organisasi yang ditampilkan di halaman utama</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
          <AppIcon icon="Plus" className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Organisasi</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-violet-50 rounded-[1.5rem] p-5 border border-green-100 flex gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <AppIcon icon="Award" className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="font-bold text-green-900 mb-1">Keanggotaan Kebun Binatang</h3>
          <p className="text-sm font-medium text-green-800/80">
            Logo-logo organisasi ini akan ditampilkan di bagian bawah (footer) halaman utama website untuk menunjukkan keanggotaan institusional Ragunan Zoo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <AppIcon icon="Award" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 mb-1">Belum ada organisasi</p>
            <p className="text-sm font-medium text-slate-500">Klik "Tambah Organisasi" untuk mulai menambahkan logo.</p>
          </div>
        ) : (
          organizations.map((org) => (
            <div key={org.id} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm p-5 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg border-slate-200 bg-white/90 hover:bg-white text-slate-600 hover:text-green-600 shadow-sm backdrop-blur-sm" onClick={() => openEdit(org)}>
                  <AppIcon icon="Pencil" className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg border-slate-200 bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 shadow-sm backdrop-blur-sm" onClick={() => handleDelete(org)}>
                  <AppIcon icon="Trash2" className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm p-2 group-hover:border-green-100 transition-colors">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl font-black text-slate-300">{org.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-lg">{org.name}</h3>
                    {!org.is_active && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] uppercase font-bold tracking-wider">Nonaktif</Badge>
                    )}
                  </div>
                  {org.full_name && (
                    <p className="text-xs font-medium text-slate-500 line-clamp-2" title={org.full_name}>{org.full_name}</p>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tampil di Web:</span>
                  <Switch 
                    checked={org.is_published !== false}
                    onCheckedChange={(checked) => handleTogglePublish(org.id, checked)}
                    className="data-[state=checked]:bg-green-500 scale-90 origin-right"
                  />
                </div>
                <div>
                  {org.website_url ? (
                    <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 hover:underline">
                      <AppIcon icon="ExternalLink" className="w-3.5 h-3.5" /> 
                      <span className="truncate max-w-[200px]">{org.website_url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 italic">Tanpa website</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-white/60">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                  <AppIcon icon="Award" className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{editing ? 'Edit Organisasi' : 'Tambah Organisasi'}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <AppIcon icon="X" className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama Singkat (Singkatan) <span className="text-rose-500">*</span></Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: SEAZA, WAZA, PKBSI" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Contoh: South East Asian Zoos and Aquariums Association" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Website URL</Label>
                <Input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://www.seaza.asia" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium" />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Logo Organisasi</Label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 p-2">
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    <Button variant="outline" className="w-full h-10 rounded-xl font-bold bg-white border-slate-200 hover:bg-slate-50" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin mr-2" /> : <AppIcon icon="Upload" className="w-4 h-4 mr-2" />}
                      {uploading ? 'Mengupload...' : 'Pilih Logo'}
                    </Button>
                    {form.logo_url && (
                      <Button variant="ghost" className="w-full h-8 rounded-lg text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => setForm(f => ({ ...f, logo_url: '' }))}>
                        Hapus Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Urutan Tampil</Label>
                  <Input type="number" min="0" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-black" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Status Tampil</Label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 h-11">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${form.is_active ? 'text-green-600' : 'text-slate-500'}`}>{form.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    <Switch checked={form.is_active} onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))} className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/80">
              <Button type="button" variant="outline" className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
                {saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Tambah Organisasi')}
              </Button>
            </div>
          </div>
        </div>
      )}
    {ConfirmComponent}
    </div>
  );
}
