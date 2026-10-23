"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Leaf, PawPrint, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Category } from '@/hooks/useCategories';
import CategoryFormModal from '@/components/modals/CategoryFormModal';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { toast } from 'sonner';
import { deleteCategoryAction, toggleCategoryActiveAction } from './actions';
import { supabase } from '@/integrations/supabase/client';
import CategoryIcon from '@/components/ui/CategoryIcon';

interface ManageCategoriesClientProps {
  initialCategories: Category[];
}

export default function ManageCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'flora' | 'fauna'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    setIsUpdating(category.id);
    try {
      // Optimistic update
      setCategories(prev => prev.map(c => 
        c.id === category.id ? { ...c, is_active: !c.is_active } : c
      ));
      
      const result = await toggleCategoryActiveAction(category.id, category.is_active);
      if (!result.success) {
        toast.error('Gagal memperbarui: ' + result.error);
        // Revert on failure
        setCategories(prev => prev.map(c => 
          c.id === category.id ? { ...c, is_active: category.is_active } : c
        ));
      } else {
        toast.success('Status kategori diperbarui');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      setIsUpdating(deleteId);
      try {
        const result = await deleteCategoryAction(deleteId);
        if (!result.success) {
          toast.error('Gagal menghapus: ' + result.error);
        } else {
          toast.success('Kategori berhasil dihapus');
          setCategories(prev => prev.filter(c => c.id !== deleteId));
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem');
      } finally {
        setIsUpdating(null);
        setDeleteId(null);
      }
    }
  };

  const handleModalSuccess = () => {
    window.location.reload();
  };

  const filteredCategories = categories.filter(c => {
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
        if (data) setCategories(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'categories') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredCategories, 9);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kelola Kategori</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola kategori flora dan fauna</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-[0_2px_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'flora' | 'fauna')}>
        <TabsList className="bg-white/60 backdrop-blur-xl border border-slate-200/60 p-1 rounded-xl h-auto">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">
            Semua ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="fauna" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 gap-2">
            <PawPrint className="w-4 h-4 text-orange-500" />
            Fauna ({categories.filter(c => c.type === 'fauna').length})
          </TabsTrigger>
          <TabsTrigger value="flora" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 gap-2">
            <Leaf className="w-4 h-4 text-green-500" />
            Flora ({categories.filter(c => c.type === 'flora').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem]">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Belum ada kategori</h3>
              <p className="text-slate-500 mt-1 mb-6">Tambahkan kategori pertama Anda</p>
              <Button onClick={handleAdd} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kategori
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((category) => (
                  <div 
                    key={category.id} 
                    className={`bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] ${!category.is_active ? 'opacity-70 grayscale-[30%]' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/90 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden p-1.5 flex-shrink-0">
                          <CategoryIcon 
                            icon={category.icon} 
                            categoryName={category.name_id} 
                            type={category.type} 
                            className="w-full h-full" 
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight">{category.name_id}</h3>
                          {category.name_en && (
                            <p className="text-xs font-medium text-slate-500">{category.name_en}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`border-0 ${category.type === 'fauna' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                        {category.type === 'fauna' ? (
                          <><PawPrint className="w-3 h-3 mr-1" />Fauna</>
                        ) : (
                          <><Leaf className="w-3 h-3 mr-1" />Flora</>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      {category.description_id && (
                        <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-4">
                          {category.description_id}
                        </p>
                      )}
                      
                      {category.image_url && (
                        <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                          <img 
                            src={category.image_url} 
                            alt={category.name_id}
                            className="w-full h-28 object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-auto">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.is_active}
                          disabled={isUpdating === category.id}
                          onCheckedChange={() => handleToggleActive(category)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-xs font-bold text-slate-500">
                          {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(category.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalItems > 9 && (
                <div className="mt-8 bg-white/60 backdrop-blur-2xl rounded-[1.5rem] border border-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[9, 18, 27, 36]}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white/90 backdrop-blur-xl border-white rounded-[1.5rem] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20">
              Hapus Kategori
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
