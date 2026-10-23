import { useState, useRef } from 'react';
import { Upload, X, FileImage, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WBSEvidenceUploadProps {
  evidenceUrls: string[];
  onEvidenceChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function WBSEvidenceUpload({
  evidenceUrls,
  onEvidenceChange,
  maxFiles = 5,
  disabled = false,
}: WBSEvidenceUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - evidenceUrls.length;
    if (remainingSlots <= 0) {
      toast.error(`Maksimal ${maxFiles} file bukti`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} terlalu besar (maks 5MB)`);
          continue;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Format file ${file.name} tidak didukung`);
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `evidence_${timestamp}_${randomString}.${extension}`;

        const { data, error } = await supabase.storage
          .from('wbs-evidence')
          .upload(filename, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Gagal mengunggah ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('wbs-evidence')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onEvidenceChange([...evidenceUrls, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} file berhasil diunggah`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Gagal mengunggah file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = evidenceUrls.filter((_, i) => i !== index);
    onEvidenceChange(newUrls);
  };

  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return <FileImage className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|webp)$/i);
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading || evidenceUrls.length >= maxFiles}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || evidenceUrls.length >= maxFiles}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Unggah Bukti
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {evidenceUrls.length}/{maxFiles} file (maks 5MB per file)
        </span>
      </div>

      {/* Preview Files */}
      {evidenceUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {evidenceUrls.map((url, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden bg-muted/30"
            >
              {isImage(url) ? (
                <img
                  src={url}
                  alt={`Bukti ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">PDF</span>
                </div>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Format yang didukung: JPG, PNG, WebP, PDF
      </p>
    </div>
  );
}
