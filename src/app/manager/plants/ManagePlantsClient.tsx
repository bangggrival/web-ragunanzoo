"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { Plant } from '@/hooks/usePlants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import PlantFormModal from '@/components/modals/PlantFormModal';
import PlantPageHeader from '@/components/plants/PlantPageHeader';
import PlantFilterBar from '@/components/plants/PlantFilterBar';
import PlantTable from '@/components/plants/PlantTable';
import PlantMobileCard from '@/components/plants/PlantMobileCard';
import PlantEmptyState from '@/components/plants/PlantEmptyState';
import UniversalBulkQRPrintModal, { QRPrintItem } from '@/components/qr/UniversalBulkQRPrintModal';
import MediaLightboxModal, { LightboxMediaData } from '@/components/media/MediaLightboxModal';
import { exportPlantsData } from '@/utils/exportManagerReports';
import { toast } from 'sonner';
import { deletePlantAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export default function ManagePlantsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkQR, setShowBulkQR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMediaData | null>(null);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('plants').select('*').order('name', { ascending: true });
      if (data) setPlants(data as any);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'plants') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const { language } = useLanguage();

  const filteredPlants = plants.filter(plant => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = !query || Object.values(plant).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
    const matchesCategory = !categoryFilter || plant.category_id === categoryFilter;
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
  } = usePagination(filteredPlants, 10);

  const hasFilters = Boolean(searchQuery || categoryFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  // Export handlers
  const handleExport = (format: 'excel' | 'pdf') => {
    try {
      if (filteredPlants.length === 0) {
        toast.error('Tidak ada data flora untuk diekspor');
        return;
      }
      exportPlantsData(filteredPlants, format);
      toast.success(`Laporan Data Flora (${format.toUpperCase()}) berhasil diunduh!`);
    } catch (err: any) {
      toast.error('Gagal mengekspor: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmMsg = language === 'en' 
      ? 'Are you sure you want to delete this plant data?' 
      : 'Apakah Anda yakin ingin menghapus data tumbuhan ini?';
    
    if ((await confirm("Konfirmasi", confirmMsg))) {
      try {
        const result = await deletePlantAction(id);
        if (!result.success) {
          toast.error((language === 'en' ? 'Failed to delete: ' : 'Gagal menghapus: ') + result.error);
        } else {
          toast.success(language === 'en' ? 'Plant deleted successfully' : 'Tumbuhan berhasil dihapus');
          setPlants(prev => prev.filter(p => p.id !== id));
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem');
      }
    }
  };

  const handleEdit = (plant: Plant) => {
    setSelectedPlant(plant);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedPlant(null);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchData();
    toast.success('Data tumbuhan berhasil disimpan');
  };

  const handleTogglePublish = async (id: number, is_published: boolean) => {
    setPlants(prev => prev.map(p => p.id === id ? { ...p, is_published } : p));
    try {
      const { error } = await supabase.from('plants').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success(language === 'en' ? 'Visibility updated' : 'Status tampil diperbarui');
    } catch (err: any) {
      toast.error((language === 'en' ? 'Failed to update status: ' : 'Gagal memperbarui status: ') + err.message);
      setPlants(prev => prev.map(p => p.id === id ? { ...p, is_published: !is_published } : p));
    }
  };

  const handleOpenLightbox = (plant: Plant) => {
    if (!plant.image_url) return;
    setLightboxMedia({
      title: (language === 'en' && plant.name_en) ? plant.name_en : plant.name,
      subtitle: plant.latin_name,
      imageUrl: plant.image_url,
      category: plant.category,
      zone: plant.zone || plant.location,
      status: plant.status,
      healthStatus: plant.health_status,
      description: (language === 'en' && plant.description_en) ? plant.description_en : plant.description
    });
  };

  // Prepare QR Print items for Flora
  const qrPrintItems: QRPrintItem[] = plants.map(plant => ({
    id: plant.id,
    name: plant.name,
    subName: plant.latin_name,
    categoryOrZone: plant.zone || plant.category || 'Zona Botani',
    qrUrl: `${BASE_URL}/flora/${plant.id}`,
    typeLabel: 'FLORA RAGUNAN'
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

  return (
    <>
      <div className="animate-fade-in space-y-6">
        <PlantPageHeader 
          onAdd={handleAdd}
          onExportExcel={() => handleExport('excel')}
          onExportPdf={() => handleExport('pdf')}
          onBulkQR={() => setShowBulkQR(true)}
        />

        <PlantFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onClearFilters={clearFilters}
        />

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <AppIcon icon="Leaf" className="w-4 h-4 text-emerald-500" />
            <span>
              {language === 'en' ? 'Total:' : 'Total:'}{' '}
              <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong>{' '}
              {language === 'en' ? 'plants' : 'koleksi tumbuhan'}
            </span>
          </div>
          {hasFilters && (
            <span className="text-xs font-semibold text-slate-400">
              ({language === 'en' ? 'filtered from' : 'difilter dari'} {plants.length})
            </span>
          )}
        </div>

        <div className="manager-table-shell">
          {paginatedItems.length === 0 ? (
            <PlantEmptyState hasFilters={hasFilters} />
          ) : (
            <>
              <div className="hidden md:block">
                <PlantTable 
                  plants={paginatedItems} 
                  loading={false} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                  onImageClick={handleOpenLightbox}
                />
              </div>
              <div className="md:hidden p-4 space-y-3">
                {paginatedItems.map((plant) => (
                  <PlantMobileCard
                    key={plant.id}
                    plant={plant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublish={handleTogglePublish}
                    onImageClick={handleOpenLightbox}
                  />
                ))}
              </div>
            </>
          )}

          {totalItems > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>

      <PlantFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plant={selectedPlant}
        onSuccess={handleModalSuccess}
      />

      {/* Universal Bulk QR Modal for Flora */}
      {showBulkQR && (
        <UniversalBulkQRPrintModal
          title="Cetak Label & Plang QR Tumbuhan (Flora)"
          items={qrPrintItems}
          onClose={() => setShowBulkQR(false)}
        />
      )}

      {/* Media Lightbox for Flora */}
      <MediaLightboxModal
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />

      {ConfirmComponent}
    </>
  );
}
