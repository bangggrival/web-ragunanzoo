import { useState } from 'react';
import { Image, FolderOpen, Upload, X, Loader2 } from 'lucide-react';
import GalleryPicker from './GalleryPicker';
import { useMediaGallery } from '@/hooks/useMediaGallery';
import { cn } from '@/lib/utils';

interface ImageInputWithGalleryProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  category?: string;
  className?: string;
  showPreview?: boolean;
  previewClassName?: string;
}

export default function ImageInputWithGallery({
  value,
  onChange,
  label,
  placeholder = 'Pilih atau upload gambar',
  category,
  className,
  showPreview = true,
  previewClassName,
}: ImageInputWithGalleryProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { uploadMedia } = useMediaGallery();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadMedia(file, { category: category || 'general' });
    if (result) {
      onChange(result.file_url);
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleGallerySelect = (url: string) => {
    onChange(url);
    setShowGallery(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium">{label}</label>
      )}

      {/* Preview */}
      {showPreview && value && (
        <div className={cn("relative w-full h-40 rounded-lg overflow-hidden bg-muted", previewClassName)}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Gallery Button */}
        <button
          type="button"
          onClick={() => setShowGallery(true)}
          className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
          title="Pilih dari galeri"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        {/* Upload Button */}
        <label className="flex items-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Gallery Modal */}
      <GalleryPicker
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleGallerySelect}
        category={category}
      />
    </div>
  );
}
