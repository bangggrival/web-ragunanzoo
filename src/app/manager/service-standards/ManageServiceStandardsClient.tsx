"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { IconPicker, allIcons } from '@/components/ui/IconPicker';
import { ServiceStandard, MOCK_SERVICE_STANDARDS } from '@/hooks/useServiceStandards';
import { upsertServiceStandardAction, deleteServiceStandardAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  service_name_id: string;
  service_name_en: string;
  requirements_id: string;
  requirements_en: string;
  procedure_id: string;
  procedure_en: string;
  duration: string;
  cost: string;
  complaint_mechanism_id: string;
  complaint_mechanism_en: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

const defaultFormData: FormData = {
  service_name_id: '',
  service_name_en: '',
  requirements_id: '',
  requirements_en: '',
  procedure_id: '',
  procedure_en: '',
  duration: '',
  cost: '',
  complaint_mechanism_id: '',
  complaint_mechanism_en: '',
  icon: 'FileText',
  order_index: 0,
  is_active: true,
};

export default function ManageServiceStandardsClient() {
  const [standards, setStandards] = useState<ServiceStandard[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: standardsData } = await supabase.from('service_standards').select('*').order('order_index', { ascending: true });
        if (standardsData !== null && Array.isArray(standardsData)) {
          setStandards(standardsData as any);
        } else {
          setStandards(MOCK_SERVICE_STANDARDS as any);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setStandards(MOCK_SERVICE_STANDARDS as any);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'service_standards') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...defaultFormData,
      order_index: standards.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (standard: ServiceStandard) => {
    setEditingId(standard.id);
    setFormData({
      service_name_id: standard.service_name_id || '',
      service_name_en: standard.service_name_en || '',
      requirements_id: standard.requirements_id || '',
      requirements_en: standard.requirements_en || '',
      procedure_id: standard.procedure_id || '',
      procedure_en: standard.procedure_en || '',
      duration: standard.duration || '',
      cost: standard.cost || '',
      complaint_mechanism_id: standard.complaint_mechanism_id || '',
      complaint_mechanism_en: standard.complaint_mechanism_en || '',
      icon: standard.icon || 'FileText',
      order_index: standard.order_index,
      is_active: standard.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_name_id.trim()) {
      toast.error('Nama layanan (ID) wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingId,
        ...formData
      };
      
      const result = await upsertServiceStandardAction(payload);
      if (!result.success) throw new Error(result.error);

      toast.success(editingId ? 'Standar pelayanan berhasil diperbarui' : 'Standar pelayanan berhasil ditambahkan');
      setIsModalOpen(false);

      const { data: updatedData } = await supabase.from('service_standards').select('*').order('order_index', { ascending: true });
      if (updatedData && updatedData.length > 0) {
        setStandards(updatedData as any);
      }
    } catch (error: any) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      const result = await deleteServiceStandardAction(deletingId);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Standar pelayanan berhasil dihapus');
      setStandards(prev => prev.filter(s => s.id !== deletingId));
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      toast.error('Terjadi kesalahan: ' + error.message);
    }
  };

  const getIcon = (iconName: string) => {
    return allIcons[iconName as keyof typeof allIcons] || allIcons['FileText'];
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="ShieldCheck" className="w-5 h-5 text-green-500" />
            </div>
            Standar Pelayanan
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            Kelola daftar standar pelayanan publik
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
          <AppIcon icon="Plus" className="w-4 h-4 mr-2" />
          Tambah Standar
        </Button>
      </div>

      {/* List - Table style for desktop, cards for mobile */}
      {standards && standards.length > 0 ? (
        <>
          <div className="hidden md:block manager-table-shell">
            <div className="manager-table-scroll">
              <table className="manager-table">
                <thead className="manager-table-head">
                  <tr>
                    <th className="manager-table-th w-16 rounded-tl-[1rem]">#</th>
                    <th className="manager-table-th">Nama Layanan</th>
                    <th className="manager-table-th">Waktu</th>
                    <th className="manager-table-th">Biaya</th>
                    <th className="manager-table-th w-28">Status</th>
                    <th className="manager-table-th manager-table-th-right w-28 rounded-tr-[1rem]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standards.map((standard, index) => {
                    const Icon = getIcon(standard.icon || 'FileText') as any;
                    return (
                      <tr key={standard.id} className={`manager-table-row ${!standard.is_active ? 'opacity-60' : ''}`}>
                        <td className="manager-table-td font-bold text-slate-400">{index + 1}</td>
                        <td className="manager-table-td">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{standard.service_name_id}</p>
                              {standard.service_name_en && (
                                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                  {standard.service_name_en}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="manager-table-td">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <AppIcon icon="Clock" className="w-4 h-4 text-slate-400" />
                            {standard.duration || '-'}
                          </div>
                        </td>
                        <td className="manager-table-td">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <AppIcon icon="Banknote" className="w-4 h-4 text-green-400" />
                            {standard.cost || '-'}
                          </div>
                        </td>
                        <td className="manager-table-td">
                          {standard.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 border border-green-200">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="manager-table-td manager-table-td-right">
                          <div className="manager-table-actions justify-end">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEdit(standard)}
                              className="w-8 h-8 rounded-lg border-slate-200 text-slate-500 hover:text-green-600 hover:bg-green-50"
                            >
                              <AppIcon icon="Pencil" className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setDeletingId(standard.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <AppIcon icon="Trash2" className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid gap-4">
            {standards.map((standard, index) => {
              const Icon = getIcon(standard.icon || 'FileText') as any;
              return (
                <div key={standard.id} className={`bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-5 shadow-sm ${!standard.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-800 line-clamp-2">
                            {standard.service_name_id}
                          </h3>
                          {standard.service_name_en && (
                            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                              {standard.service_name_en}
                            </p>
                          )}
                        </div>
                        {standard.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded border bg-green-50 text-green-600 border-green-200 text-[10px] font-bold flex-shrink-0">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-bold flex-shrink-0">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 flex-1">
                          <AppIcon icon="Clock" className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{standard.duration || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-1">
                          <AppIcon icon="Banknote" className="w-3.5 h-3.5 text-green-400" />
                          <span className="truncate">{standard.cost || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(standard)}
                          className="rounded-xl font-bold border-slate-200 text-slate-600 hover:text-green-600"
                        >
                          <AppIcon icon="Pencil" className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingId(standard.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="rounded-xl font-bold border-slate-200 text-slate-600 hover:text-rose-600"
                        >
                          <AppIcon icon="Trash2" className="w-3.5 h-3.5 mr-1.5" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-12 text-center rounded-[1.5rem] shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <AppIcon icon="ShieldCheck" className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada standar pelayanan</h3>
          <p className="text-slate-500 font-medium mb-6">
            Mulai dengan menambahkan standar pelayanan pertama
          </p>
          <Button onClick={handleOpenCreate} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold px-6">
            <AppIcon icon="Plus" className="w-4 h-4 mr-2" />
            Tambah Standar
          </Button>
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <AppIcon icon="ShieldCheck" className="w-5 h-5 text-green-500" />
              </div>
              {editingId ? 'Edit Standar Pelayanan' : 'Tambah Standar Pelayanan'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <div className="space-y-8">
                {/* Basic Info Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <AppIcon icon="FileText" className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-slate-800">Informasi Dasar</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="service_name_id" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Nama Layanan (Indonesia) <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="service_name_id"
                        value={formData.service_name_id}
                        onChange={(e) => setFormData({ ...formData, service_name_id: e.target.value })}
                        placeholder="Masukkan nama layanan"
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="service_name_en" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Nama Layanan (English)
                      </Label>
                      <Input
                        id="service_name_en"
                        value={formData.service_name_en}
                        onChange={(e) => setFormData({ ...formData, service_name_en: e.target.value })}
                        placeholder="Enter service name"
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Ikon</Label>
                      <IconPicker
                        value={formData.icon}
                        onChange={(icon) => setFormData({ ...formData, icon })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="duration" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Waktu Penyelesaian</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="3-5 hari kerja"
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cost" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Biaya</Label>
                      <Input
                        id="cost"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="Gratis / Rp 50.000"
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="order_index" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Urutan Tampil</Label>
                      <Input
                        id="order_index"
                        type="number"
                        min={0}
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <AppIcon icon="ShieldCheck" className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-slate-800">Persyaratan</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="requirements_id" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Indonesia</Label>
                      <Textarea
                        id="requirements_id"
                        value={formData.requirements_id}
                        onChange={(e) => setFormData({ ...formData, requirements_id: e.target.value })}
                        placeholder="Masukkan persyaratan (satu per baris)&#10;- Surat Pengantar&#10;- KTP&#10;- Proposal"
                        rows={5}
                        className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="requirements_en" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">English</Label>
                      <Textarea
                        id="requirements_en"
                        value={formData.requirements_en}
                        onChange={(e) => setFormData({ ...formData, requirements_en: e.target.value })}
                        placeholder="Enter requirements (one per line)&#10;- Cover Letter&#10;- ID Card&#10;- Proposal"
                        rows={5}
                        className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Procedure Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <AppIcon icon="GripVertical" className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-slate-800">Prosedur / SOP</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="procedure_id" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Indonesia</Label>
                      <Textarea
                        id="procedure_id"
                        value={formData.procedure_id}
                        onChange={(e) => setFormData({ ...formData, procedure_id: e.target.value })}
                        placeholder="Masukkan langkah-langkah prosedur&#10;1. Langkah pertama&#10;2. Langkah kedua"
                        rows={5}
                        className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="procedure_en" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">English</Label>
                      <Textarea
                        id="procedure_en"
                        value={formData.procedure_en}
                        onChange={(e) => setFormData({ ...formData, procedure_en: e.target.value })}
                        placeholder="Enter procedure steps&#10;1. First step&#10;2. Second step"
                        rows={5}
                        className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Complaint Mechanism Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <AppIcon icon="ShieldCheck" className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-slate-800">Mekanisme Pengaduan</h4>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="complaint_id" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Indonesia</Label>
                      <Textarea
                        id="complaint_id"
                        value={formData.complaint_mechanism_id}
                        onChange={(e) => setFormData({ ...formData, complaint_mechanism_id: e.target.value })}
                        placeholder="Cara menyampaikan pengaduan&#10;- WhatsApp: xxx&#10;- Email: xxx"
                        rows={4}
                        className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="complaint_en" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">English</Label>
                      <Textarea
                        id="complaint_en"
                        value={formData.complaint_mechanism_en}
                        onChange={(e) => setFormData({ ...formData, complaint_mechanism_en: e.target.value })}
                        placeholder="How to submit complaints&#10;- WhatsApp: xxx&#10;- Email: xxx"
                        rows={4}
                        className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-5 bg-green-50/50 border border-green-100 rounded-2xl">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-green-900">Status Aktif</Label>
                    <p className="text-[11px] font-medium text-green-600/80">
                      Tampilkan standar pelayanan ini di halaman publik
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6">
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6"
              >
                {saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Standar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Hapus Standar Pelayanan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Tindakan ini tidak dapat dibatalkan. Standar pelayanan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold bg-slate-50 hover:bg-slate-100 border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
            >
              Hapus Standar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
