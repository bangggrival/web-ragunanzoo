"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { 
  Plus, 
  Save, 
  Loader2,
  Trash2,
  Edit2,
  GripVertical,
  Link as LinkIcon,
  ExternalLink,
  Smartphone,
  Monitor,
  AlertCircle,
  Info,
  ChevronDown,
  LayoutTemplate
} from 'lucide-react';
import { z } from 'zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPickerGrid, allIcons } from '@/components/ui/IconPicker';
import { NavbarItem, deleteNavbarItemAction, toggleNavbarItemAction, updateNavbarOrderAction, upsertNavbarItemAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

const iconMap = allIcons;

const menuSchema = z.object({
  label_id: z.string().min(1, 'Label Indonesia wajib diisi').max(50, 'Maksimal 50 karakter'),
  label_en: z.string().max(50, 'Maksimal 50 karakter').optional(),
  path: z.string().min(1, 'Path/URL wajib diisi').max(200, 'Maksimal 200 karakter'),
  path_en: z.string().max(200, 'Maksimal 200 karakter').optional(),
  icon: z.string().min(1, 'Icon wajib dipilih'),
});

function SortableNavbarItem({ 
  item, 
  onToggle, 
  onEdit, 
  onDelete,
  allItems,
}: {
  item: NavbarItem;
  onToggle: (id: string, field: string, value: boolean) => void;
  onEdit: (item: NavbarItem) => void;
  onDelete: (item: NavbarItem) => void;
  allItems: NavbarItem[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LinkIcon;
  const isExternal = item.path.startsWith('http') || (item.path_en && item.path_en.startsWith('http'));
  const isHome = item.path === '/';
  const parentItem = item.parent_id ? allItems.find(i => i.id === item.parent_id) : null;
  const childCount = allItems.filter(i => i.parent_id === item.id).length;



  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        rounded-[1.5rem] border bg-white/80 backdrop-blur-xl p-5 transition-all duration-300
        ${item.is_active ? 'border-white/80 shadow-sm hover:shadow-md' : 'border-dashed border-slate-200 opacity-60'}
        ${isDragging ? 'shadow-xl ring-2 ring-green-500/20' : ''}
        ${item.parent_id ? 'ml-8 sm:ml-12 border-l-4 border-l-green-300' : ''}
      `}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div 
            {...attributes} 
            {...listeners}
            className="mt-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <div className={`
            p-3 rounded-xl flex-shrink-0 border
            ${item.is_active 
              ? 'bg-green-50 text-green-500 border-green-100' 
              : 'bg-slate-50 text-slate-400 border-slate-100'
            }
          `}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-lg">{item.label_id}</h3>
              {item.is_system && (
                <Badge variant="secondary" className="text-[10px] px-2 h-5 font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-slate-200">
                  Sistem
                </Badge>
              )}
              {isExternal && (
                <Badge variant="outline" className="text-[10px] px-2 h-5 gap-1 font-bold uppercase tracking-wider text-amber-600 border-amber-200 bg-amber-50">
                  <ExternalLink className="w-3 h-3" />
                  Eksternal
                </Badge>
              )}
              {item.is_dropdown && (
                <Badge variant="secondary" className="text-[10px] px-2 h-5 gap-1 font-bold uppercase tracking-wider bg-green-50 text-green-600">
                  <ChevronDown className="w-3 h-3" />
                  Dropdown ({childCount})
                </Badge>
              )}
              {parentItem && (
                <Badge variant="outline" className="text-[10px] px-2 h-5 font-bold uppercase tracking-wider text-slate-500 border-slate-200">
                  Sub: {parentItem.label_id}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {item.label_en || <span className="italic opacity-60">Tanpa terjemahan</span>}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <code className="text-[11px] font-bold bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 truncate max-w-[200px]" title={item.path}>
                🇮🇩 {item.path}
              </code>
              {item.path_en && (
                <code className="text-[11px] font-bold bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 truncate max-w-[200px]" title={item.path_en}>
                  🇬🇧 {item.path_en}
                </code>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button 
              onClick={() => onEdit(item)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {!item.is_system && (
              <button 
                onClick={() => onDelete(item)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 ml-12 pl-4 border-l-2 border-slate-100 mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Switch
              checked={item.is_active}
              onCheckedChange={(checked) => onToggle(item.id, 'is_active', checked)}
              disabled={isHome}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={`text-sm font-bold ${item.is_active ? 'text-slate-700' : 'text-slate-400'}`}>
              Aktif
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Switch
              checked={item.show_in_top_nav}
              onCheckedChange={(checked) => onToggle(item.id, 'show_in_top_nav', checked)}
              disabled={isHome}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
              <Monitor className="w-4 h-4" />
              Top Nav
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <Switch
              checked={item.show_in_bottom_nav}
              onCheckedChange={(checked) => onToggle(item.id, 'show_in_bottom_nav', checked)}
              disabled={isHome}
              className="data-[state=checked]:bg-violet-500"
            />
            <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              Bottom Nav
            </span>
          </label>

          {!item.parent_id && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <Switch
                checked={item.is_dropdown || false}
                onCheckedChange={(checked) => onToggle(item.id, 'is_dropdown', checked)}
                disabled={isHome}
                className="data-[state=checked]:bg-blue-500"
              />
              <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                <ChevronDown className="w-4 h-4" />
                Dropdown
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageExplorerNavbarClient() {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NavbarItem | null>(null);
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [formData, setFormData] = useState({
    label_id: '',
    label_en: '',
    path: '',
    path_en: '',
    icon: 'Link',
    parent_id: '' as string,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: itemsData } = await supabase.from('navbar_items').select('*').order('order_index', { ascending: true });
        if (itemsData) setItems(itemsData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'navbar_items') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      const result = await updateNavbarOrderAction(updates);
      if (!result.success) throw new Error(result.error);
      toast.success('Urutan menu berhasil diperbarui');
    } catch (error: any) {
      toast.error('Gagal memperbarui urutan: ' + error.message);
    }
  };

  const handleToggle = async (id: string, field: string, value: boolean) => {
    try {
      const result = await toggleNavbarItemAction(id, field, value);
      if (!result.success) throw new Error(result.error);
      
      setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
      toast.success('Pengaturan menu berhasil diperbarui');
    } catch (error: any) {
      toast.error('Gagal memperbarui: ' + error.message);
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({ label_id: '', label_en: '', path: '/', path_en: '', icon: 'Link', parent_id: '' });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (item: NavbarItem) => {
    setEditingItem(item);
    setFormData({
      label_id: item.label_id,
      label_en: item.label_en || '',
      path: item.path,
      path_en: item.path_en || '',
      icon: item.icon,
      parent_id: item.parent_id || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleSaveItem = async () => {
    const result = menuSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, any> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    const pathValue = formData.path.trim();
    const pathEnValue = formData.path_en?.trim() || '';
    const isExternal = pathValue.startsWith('http://') || pathValue.startsWith('https://');
    const isExternalEn = pathEnValue.startsWith('http://') || pathEnValue.startsWith('https://');
    
    if (!isExternal && !pathValue.startsWith('/')) {
      setFormErrors(prev => ({ ...prev, path: 'Path internal harus diawali dengan / atau URL eksternal dengan http://' }));
      return;
    }
    if (pathEnValue && !isExternalEn && !pathEnValue.startsWith('/')) {
      setFormErrors(prev => ({ ...prev, path_en: 'Path internal harus diawali dengan / atau URL eksternal dengan http://' }));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingItem?.id,
        label_id: formData.label_id.trim(),
        label_en: formData.label_en?.trim() || null,
        path: pathValue,
        path_en: pathEnValue || null,
        icon: formData.icon,
        parent_id: formData.parent_id || null,
      };

      const res = await upsertNavbarItemAction(payload);
      if (!res.success) throw new Error(res.error);

      toast.success(editingItem ? 'Menu berhasil diperbarui' : 'Menu baru ditambahkan');
      setDialogOpen(false);
      
      // Update local state instead of refetching for immediate UI feedback
      if (editingItem) {
        setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...payload } as NavbarItem : item));
      } else {
        // Need a page reload to get the real ID, but for now we just show success
        window.location.reload();
      }
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteItem = (item: NavbarItem) => {
    if (item.is_system) {
      toast.error('Menu sistem tidak dapat dihapus');
      return;
    }
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const result = await deleteNavbarItemAction(itemToDelete.id);
      if (!result.success) throw new Error(result.error);

      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      toast.success('Menu berhasil dihapus');
    } catch (error: any) {
      toast.error('Gagal menghapus: ' + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const activeCount = items.filter(i => i.is_active).length;
  const topNavCount = items.filter(i => i.show_in_top_nav && i.is_active).length;
  const bottomNavCount = items.filter(i => i.show_in_bottom_nav && i.is_active).length;

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
              <LayoutTemplate className="w-5 h-5 text-green-500" />
            </div>
            Menu Navigasi
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola struktur menu yang tampil di halaman pengunjung</p>
        </div>
        <button onClick={openAddDialog} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
          <Plus className="w-5 h-5" />
          Tambah Menu Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <LinkIcon className="w-16 h-16 text-slate-800" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aktif</span>
          </div>
          <p className="text-3xl font-black text-slate-800 relative z-10">{activeCount}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Monitor className="w-16 h-16 text-green-800" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Di Top Nav</span>
          </div>
          <p className="text-3xl font-black text-green-500 relative z-10">{topNavCount}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Smartphone className="w-16 h-16 text-green-800" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Di Bottom Nav</span>
          </div>
          <p className="text-3xl font-black text-green-500 relative z-10">{bottomNavCount}</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-[1.5rem] border border-white/80 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
            <GripVertical className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Struktur Navigasi</h2>
            <p className="text-sm font-medium text-slate-500">Drag & drop untuk mengubah urutan. Item di atas akan tampil lebih dulu.</p>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {items.map((item) => (
                <SortableNavbarItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onEdit={openEditDialog}
                  onDelete={confirmDeleteItem}
                  allItems={items}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <LinkIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 mb-1">Belum ada menu</p>
            <p className="text-sm text-slate-500">Klik "Tambah Menu Baru" untuk memulai.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-6 flex gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 mb-2">Panduan Pengaturan Navigasi</h3>
          <div className="text-sm font-medium text-blue-800/80 space-y-2">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><strong>Path Internal:</strong> Gunakan format /nama-halaman (contoh: /gallery)</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><strong>URL Eksternal:</strong> Gunakan URL lengkap dengan https://</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><strong>Top Nav:</strong> Tampil di header desktop & menu hamburger mobile</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><strong>Bottom Nav:</strong> Tampil di bar bawah khusus layar mobile</div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-white/40 rounded-[2rem] p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                {editingItem ? <Edit2 className="w-5 h-5 text-green-500" /> : <Plus className="w-5 h-5 text-green-500" />}
              </div>
              {editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Label Indonesia *</Label>
                <Input value={formData.label_id} onChange={e => setFormData(prev => ({ ...prev, label_id: e.target.value }))} placeholder="Contoh: Beranda" className={`bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 ${formErrors.label_id ? 'border-rose-300 focus-visible:ring-rose-500' : ''}`} />
                {formErrors.label_id && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.label_id}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Label English</Label>
                <Input value={formData.label_en} onChange={e => setFormData(prev => ({ ...prev, label_en: e.target.value }))} placeholder="Example: Home" className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Path Indonesia *</Label>
                <Input value={formData.path} onChange={e => setFormData(prev => ({ ...prev, path: e.target.value }))} placeholder="/page atau https://..." className={`bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 ${formErrors.path ? 'border-rose-300 focus-visible:ring-rose-500' : ''}`} />
                {formErrors.path && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.path}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Path English</Label>
                <Input value={formData.path_en} onChange={e => setFormData(prev => ({ ...prev, path_en: e.target.value }))} placeholder="/en/page atau https://..." className={`bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 ${formErrors.path_en ? 'border-rose-300 focus-visible:ring-rose-500' : ''}`} />
                {formErrors.path_en && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.path_en}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sub-menu dari (Opsional)</Label>
              <select value={formData.parent_id} onChange={e => setFormData(prev => ({ ...prev, parent_id: e.target.value }))} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none font-medium text-sm text-slate-700">
                <option value="">-- Menu Utama --</option>
                {items.filter(i => i.is_dropdown && i.id !== editingItem?.id).map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.label_id}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ikon Menu *</Label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <IconPickerGrid value={formData.icon} onChange={icon => setFormData(prev => ({ ...prev, icon }))} maxHeight="200px" />
              </div>
              {formErrors.icon && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.icon}</p>}
            </div>
          </DialogBody>

          <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-[2rem]">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">Batal</Button>
            <Button onClick={handleSaveItem} disabled={saving} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingItem ? 'Simpan Perubahan' : 'Tambah Menu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Hapus Menu?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">Anda akan menghapus menu "{itemToDelete?.label_id}". Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
