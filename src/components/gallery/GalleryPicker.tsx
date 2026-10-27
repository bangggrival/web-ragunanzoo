import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from '@/components/ui/AppIcon';
import { useMediaGallery, MediaItem, MEDIA_CATEGORIES } from '@/hooks/useMediaGallery';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GalleryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, media?: MediaItem) => void;
  category?: string;
  multiple?: boolean;
  onMultipleSelect?: (urls: string[]) => void;
}

export default function GalleryPicker({ 
  isOpen, 
  onClose, 
  onSelect,
  category: initialCategory,
  multiple = false,
  onMultipleSelect,
}: GalleryPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { media, loading, uploadMedia } = useMediaGallery(
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  // Filter by search query
  const filteredMedia = media.filter(item => 
    item.original_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      await uploadMedia(file, { 
        category: selectedCategory === 'all' ? 'general' : selectedCategory 
      });
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelectedItems(prev => 
        prev.includes(item.file_url)
          ? prev.filter(url => url !== item.file_url)
          : [...prev, item.file_url]
      );
    } else {
      onSelect(item.file_url, item);
      onClose();
    }
  };

  const handleConfirmMultiple = () => {
    if (onMultipleSelect) {
      onMultipleSelect(selectedItems);
    }
    onClose();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-card shadow-2xl border border-border/50 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0 bg-background/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
              <AppIcon name="solar:folder-with-files-bold-duotone" className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Galeri Media</h2>
              <p className="text-sm text-muted-foreground">
                {multiple ? 'Pilih satu atau lebih gambar untuk ditambahkan' : 'Pilih gambar dari galeri untuk ditambahkan'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground rounded-xl transition-colors">
            <AppIcon name="solar:close-circle-bold" className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-border/50 shrink-0 bg-muted/20">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <AppIcon name="solar:magnifer-bold-duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari gambar..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] rounded-xl bg-background border-border/60">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {MEDIA_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex bg-background border border-border/60 rounded-xl overflow-hidden shadow-sm p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <AppIcon name="solar:widget-4-bold-duotone" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <AppIcon name="solar:list-bold-duotone" className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl cursor-pointer hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all font-medium">
            {uploading ? (
              <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" />
            ) : (
              <AppIcon name="solar:upload-track-2-bold-duotone" className="w-4 h-4" />
            )}
            <span className="text-sm">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AppIcon name="solar:spinner-linear" className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground animate-pulse">Memuat galeri...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AppIcon name="solar:gallery-bold-duotone" className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Belum ada gambar</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Upload gambar baru atau ubah kata kunci pencarian Anda untuk menemukan media.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300",
                    selectedItems.includes(item.file_url)
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-background shadow-sm hover:shadow-md'
                  )}
                >
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.original_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <span className="text-white text-xs font-medium truncate drop-shadow-md">
                      {item.original_name}
                    </span>
                  </div>
                  {multiple && selectedItems.includes(item.file_url) && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/40 animate-in zoom-in-50 duration-200">
                      <AppIcon name="solar:check-circle-bold" className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl cursor-pointer border transition-all duration-200 bg-background hover:shadow-md hover:-translate-y-0.5",
                    selectedItems.includes(item.file_url)
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                      : 'border-border/60 hover:border-primary/40'
                  )}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <img
                      src={item.file_url}
                      alt={item.alt_text || item.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {multiple && selectedItems.includes(item.file_url) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                        <AppIcon name="solar:check-circle-bold" className="w-6 h-6 text-primary drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.original_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatFileSize(item.file_size)} • {MEDIA_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {multiple && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-background/80 shrink-0">
            <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
              <span className="text-foreground">{selectedItems.length}</span> gambar dipilih
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItems([])}
                className="px-5 py-2.5 bg-background border border-border/60 rounded-xl hover:bg-muted font-medium transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleConfirmMultiple}
                disabled={selectedItems.length === 0}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 font-medium text-sm"
              >
                Gunakan ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
