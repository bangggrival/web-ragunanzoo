"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { Animal } from '@/hooks/useAnimals';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { deleteAnimalAction } from './actions';
import AnimalFormModal from '@/components/modals/AnimalFormModal';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import QRCodeBulkGenerator from '@/components/qr/QRCodeBulkGenerator';
import UniversalBulkQRPrintModal, { QRPrintItem } from '@/components/qr/UniversalBulkQRPrintModal';
import MediaLightboxModal, { LightboxMediaData } from '@/components/media/MediaLightboxModal';
import QuickAudioPlayer from '@/components/media/QuickAudioPlayer';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { exportAnimalsData } from '@/utils/exportManagerReports';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export default function ManageAnimalsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [qrAnimal, setQrAnimal] = useState<Animal | null>(null);
  const [showBulkQR, setShowBulkQR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMediaData | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('animals').select('*').order('name', { ascending: true });
      if (data) setAnimals(data as any);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'animals') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const { getFaunaCategories, getCategoryDisplay } = useCategories();
  const { language } = useLanguage();
  const faunaCategories = getFaunaCategories();

  const filteredAnimals = animals.filter(animal => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = !query || Object.values(animal).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
    const matchesCategory = !categoryFilter || animal.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredAnimals, 10);

  const selectedCategoryName = faunaCategories.find(c => c.id === categoryFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  // Toggle selection
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAnimals.length && filteredAnimals.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAnimals.map(a => a.id));
    }
  };

  // Export handlers
  const handleExport = (format: 'excel' | 'pdf') => {
    try {
      const dataToExport = selectedIds.length > 0 
        ? animals.filter(a => selectedIds.includes(a.id)) 
        : filteredAnimals;

      if (dataToExport.length === 0) {
        toast.error('Tidak ada data yang cocok untuk diekspor');
        return;
      }

      exportAnimalsData(dataToExport, format);
      toast.success(`Laporan Data Satwa (${format.toUpperCase()}) berhasil diunduh!`);
    } catch (err: any) {
      toast.error('Gagal mengekspor: ' + err.message);
    }
  };

  // Bulk Status Update
  const handleBulkHealthStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('animals')
        .update({ health_status: status })
        .in('id', selectedIds);

      if (error) throw error;

      toast.success(`Status kesehatan ${selectedIds.length} satwa diperbarui menjadi '${status}'`);
      setAnimals(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, health_status: status } : a));
      setSelectedIds([]);
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (await confirm("Konfirmasi Hapus Massal", `Apakah Anda yakin ingin menghapus ${selectedIds.length} data satwa terpilih?`)) {
      try {
        const { error } = await supabase
          .from('animals')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;

        toast.success(`${selectedIds.length} satwa berhasil dihapus`);
        setAnimals(prev => prev.filter(a => !selectedIds.includes(a.id)));
        setSelectedIds([]);
      } catch (err: any) {
        toast.error('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus data satwa ini?'))) {
      setIsDeleting(id);
      try {
        const result = await deleteAnimalAction(id);
        if (!result.success) {
          toast.error('Gagal menghapus: ' + result.error);
        } else {
          toast.success('Satwa berhasil dihapus');
          setAnimals(prev => prev.filter(a => a.id !== id));
          setSelectedIds(prev => prev.filter(i => i !== id));
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedAnimal(null);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchData();
    toast.success('Data satwa berhasil disimpan');
  };

  const handleOpenLightbox = (animal: Animal) => {
    if (!animal.image_url) return;
    setLightboxMedia({
      title: (language === 'en' && animal.name_en) ? animal.name_en : animal.name,
      subtitle: animal.latin_name,
      imageUrl: animal.image_url,
      category: animal.category || animal.species,
      zone: animal.zone || animal.location,
      status: animal.status,
      healthStatus: animal.health_status,
      audioUrl: animal.audio_url,
      modelUrl: animal.model_url,
      description: (language === 'en' && animal.description_en) ? animal.description_en : animal.description
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Dilindungi':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Rentan':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getHealthColor = (health: string | null) => {
    switch (health) {
      case 'Sehat':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Sakit':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Perawatan':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLocalImage = (imageUrl: string | null) => {
    return imageUrl || '';
  };
  
  const handleTogglePublish = async (id: number, is_published: boolean) => {
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, is_published } : a));
    try {
      const { error } = await supabase.from('animals').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success(language === 'en' ? 'Visibility updated' : 'Status tampil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, is_published: !is_published } : a));
    }
  };

  const handleToggleFeatured = async (id: number, is_featured: boolean) => {
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, is_featured } : a));
    try {
      const { error } = await supabase.from('animals').update({ is_featured }).eq('id', id);
      if (error) throw error;
      toast.success(language === 'en' ? 'Featured status updated' : 'Status highlight diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, is_featured: !is_featured } : a));
    }
  };

  // Prepare items for Bulk QR Print
  const qrPrintItems: QRPrintItem[] = animals.map(animal => ({
    id: animal.id,
    name: animal.name,
    subName: animal.latin_name,
    categoryOrZone: animal.zone || animal.category || 'Zona Satwa',
    qrUrl: `${BASE_URL}/animals/${animal.id}`,
    typeLabel: 'SATWA RAGUNAN'
  }));

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

  const isAllSelected = filteredAnimals.length > 0 && selectedIds.length === filteredAnimals.length;

  return (
    <>
      <div className="animate-fade-in space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Satwa</h1>
            <p className="text-slate-500 font-medium mt-1">Kelola data satwa di Taman Margasatwa Ragunan</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold shadow-2xs btn-interactive text-xs sm:text-sm"
                >
                  <AppIcon icon="Download" className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Laporan</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl">
                <DropdownMenuItem 
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <AppIcon icon="FileSpreadsheet" className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor ke Excel (.xlsx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <AppIcon icon="FileText" className="w-4 h-4 text-rose-600" />
                  <span>Cetak Dokumen PDF (.pdf)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bulk QR Print */}
            <button 
              onClick={() => setShowBulkQR(true)}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold shadow-2xs btn-interactive text-xs sm:text-sm"
            >
              <AppIcon icon="Printer" className="w-4 h-4 text-slate-500" />
              <span>Cetak QR Massal</span>
            </button>

            {/* Tambah Satwa */}
            <button 
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all font-semibold shadow-md shadow-emerald-500/20 btn-interactive text-xs sm:text-sm"
            >
              <AppIcon icon="Plus" className="w-4 h-4" />
              Tambah Satwa
            </button>
          </div>
        </div>

        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <AppIcon icon="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama satwa, nama latin, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="manager-input pl-11"
            />
          </div>
          <div className="relative min-w-[200px]">
            <AppIcon icon="Filter" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="manager-select pl-11"
            >
              <option value="">{language === 'en' ? 'All Categories' : 'Semua Kategori'}</option>
              {faunaCategories.map(c => (
                <option key={c.id} value={c.id}>{getCategoryDisplay(c, language)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter tags indicator */}
        {(searchQuery || categoryFilter) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{language === 'en' ? 'Active filters:' : 'Filter aktif:'}</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-full text-xs font-semibold">
                Pencarian: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="hover:bg-green-100 rounded-full p-0.5">
                  <AppIcon icon="X" className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryFilter && selectedCategoryName && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                {getCategoryDisplay(selectedCategoryName, language)}
                <button onClick={() => setCategoryFilter('')} className="hover:bg-teal-100 rounded-full p-0.5">
                  <AppIcon icon="X" className="w-3 h-3" />
                </button>
              </span>
            )}
            <button 
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Bulk Action Bar (Floating notification bar when items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-slide-in-up">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                {selectedIds.length} satwa dipilih dari tabel
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBulkQR(true)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <AppIcon icon="Printer" className="w-3.5 h-3.5" />
                Cetak Label QR
              </button>

              <button
                onClick={() => handleBulkHealthStatus('Sehat')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <AppIcon icon="CheckCircle2" className="w-3.5 h-3.5" />
                Set Status Sehat
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <AppIcon icon="Trash2" className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs text-slate-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Main Table Shell */}
        <div className="manager-table-shell">
          <div className="hidden md:block manager-table-scroll">
            <table className="manager-table">
              <thead className="manager-table-head">
                <tr>
                  <th className="manager-table-th w-10 text-center rounded-tl-[1rem]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Pilih semua"
                    />
                  </th>
                  <th className="manager-table-th">Satwa</th>
                  <th className="manager-table-th">Nama Latin</th>
                  <th className="manager-table-th">Lokasi</th>
                  <th className="manager-table-th">Status</th>
                  <th className="manager-table-th text-center">Tampil</th>
                  <th className="manager-table-th text-center">Highlight</th>
                  <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((animal) => {
                  const isSelected = selectedIds.includes(animal.id);

                  return (
                    <tr 
                      key={animal.id} 
                      className={`manager-table-row transition-colors ${isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}
                    >
                      <td className="manager-table-td text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(animal.id)}
                          aria-label={`Pilih ${animal.name}`}
                        />
                      </td>
                      <td className="manager-table-td">
                        <div className="flex items-center gap-3">
                          {/* Lightbox Trigger Image */}
                          <button
                            type="button"
                            onClick={() => handleOpenLightbox(animal)}
                            className="relative group/img flex-shrink-0 cursor-pointer"
                            title="Klik untuk pratinjau foto resolusi tinggi"
                          >
                            <img
                              src={getLocalImage(animal.image_url)}
                              alt={animal.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover/img:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <AppIcon icon="ZoomIn" className="w-4 h-4 drop-shadow" />
                            </div>
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{animal.name}</p>
                              {animal.audio_url && (
                                <QuickAudioPlayer audioUrl={animal.audio_url} />
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-500 md:hidden mt-0.5">{animal.latin_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="manager-table-td">
                        <p className="text-sm font-medium italic text-slate-500">{animal.latin_name || '-'}</p>
                      </td>
                      <td className="manager-table-td">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                          <AppIcon icon="MapPin" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{animal.location || animal.zone || '-'}</span>
                        </div>
                      </td>
                      <td className="manager-table-td">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border w-fit ${getStatusColor(animal.status)}`}>
                            <AppIcon icon="Shield" className="w-3 h-3" />
                            {animal.status || 'Aman'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border w-fit ${getHealthColor(animal.health_status)}`}>
                            {animal.health_status || 'Sehat'}
                          </span>
                        </div>
                      </td>
                      <td className="manager-table-td text-center">
                        <Switch 
                          checked={animal.is_published !== false}
                          onCheckedChange={(checked) => handleTogglePublish(animal.id, checked)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </td>
                      <td className="manager-table-td text-center">
                        <Switch 
                          checked={animal.is_featured === true}
                          onCheckedChange={(checked) => handleToggleFeatured(animal.id, checked)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </td>
                      <td className="manager-table-td manager-table-th-right">
                        <div className="manager-table-actions justify-end">
                          <button 
                            onClick={() => setQrAnimal(animal)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Generate QR Code"
                          >
                            <AppIcon icon="QrCode" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(animal)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <AppIcon icon="Edit2" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(animal.id)}
                            disabled={isDeleting === animal.id}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            <AppIcon icon="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedItems.map((animal) => {
              const isSelected = selectedIds.includes(animal.id);

              return (
                <div key={animal.id} className={`p-4 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(animal.id)}
                      className="mt-1"
                    />

                    <button
                      type="button"
                      onClick={() => handleOpenLightbox(animal)}
                      className="relative group/img flex-shrink-0 cursor-pointer"
                    >
                      <img
                        src={getLocalImage(animal.image_url)}
                        alt={animal.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-slate-800">{animal.name}</p>
                        {animal.audio_url && (
                          <QuickAudioPlayer audioUrl={animal.audio_url} />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 italic truncate">{animal.latin_name}</p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(animal.status)}`}>
                          <AppIcon icon="Shield" className="w-2.5 h-2.5" />
                          {animal.status || 'Aman'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getHealthColor(animal.health_status)}`}>
                          {animal.health_status || 'Sehat'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <AppIcon icon="MapPin" className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{animal.location || animal.zone || '-'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQrAnimal(animal)}
                        className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg"
                      >
                        <AppIcon icon="QrCode" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(animal)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
                      >
                        <AppIcon icon="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(animal.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <AppIcon icon="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100">
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      </div>

      {/* Modal Form Edit / Add */}
      {showModal && (
        <AnimalFormModal
          isOpen={showModal}
          animal={selectedAnimal}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Single QR Code Modal */}
      {qrAnimal && (
        <QRCodeGenerator
          animal={qrAnimal}
          baseUrl={BASE_URL}
          onClose={() => setQrAnimal(null)}
        />
      )}

      {/* Bulk QR Print Modal for Animals and Facilities */}
      {showBulkQR && (
        <QRCodeBulkGenerator
          animals={animals}
          baseUrl={BASE_URL}
          defaultTab="animals"
          onClose={() => setShowBulkQR(false)}
        />
      )}

      {/* Media Lightbox Modal */}
      <MediaLightboxModal
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />

      {ConfirmComponent}
    </>
  );
}
