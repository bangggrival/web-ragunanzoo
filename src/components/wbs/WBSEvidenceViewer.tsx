import { useState } from 'react';
import { FileImage, FileText, ExternalLink, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface WBSEvidenceViewerProps {
  evidenceUrls: string[];
}

export function WBSEvidenceViewer({ evidenceUrls }: WBSEvidenceViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!evidenceUrls || evidenceUrls.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">Tidak ada bukti dilampirkan</p>
    );
  }

  const isImage = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|webp)$/i);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidenceUrls.map((url, index) => (
          <div
            key={index}
            className="relative group border rounded-lg overflow-hidden bg-muted/30 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => {
              if (isImage(url)) {
                setSelectedImage(url);
              } else {
                window.open(url, '_blank');
              }
            }}
          >
            {isImage(url) ? (
              <>
                <img
                  src={url}
                  alt={`Bukti ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Lihat</span>
                </div>
              </>
            ) : (
              <div className="w-full h-24 flex flex-col items-center justify-center gap-2 group-hover:bg-muted/50 transition-colors">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-white/80"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Bukti"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
