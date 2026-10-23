import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Animal } from '@/hooks/useAnimals';

interface QRCodeGeneratorProps {
  animal: Animal;
  baseUrl: string;
  onClose: () => void;
}

export default function QRCodeGenerator({ animal, baseUrl, onClose }: QRCodeGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const qrUrl = `${baseUrl}/animals/${animal.id}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-svg-${animal.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
      }
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${animal.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${animal.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              padding: 20mm;
            }
            .qr-card {
              border: 3px solid #1B5E20;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              max-width: 300px;
            }
            .qr-header {
              color: #1B5E20;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .qr-name {
              font-size: 20px;
              font-weight: 700;
              color: #1B5E20;
              margin-bottom: 4px;
            }
            .qr-latin {
              font-size: 14px;
              color: #666;
              font-style: italic;
              margin-bottom: 16px;
            }
            .qr-code-container {
              background: white;
              padding: 16px;
              border-radius: 12px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .qr-footer {
              font-size: 12px;
              color: #888;
            }
            .qr-location {
              font-size: 13px;
              color: #1B5E20;
              font-weight: 500;
              margin-top: 12px;
              padding: 8px 12px;
              background: #E8F5E9;
              border-radius: 8px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-manager-border">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-manager-primary" />
            <h2 className="font-bold text-lg">QR Code Satwa</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Preview */}
        <div className="p-6">
          <div ref={printRef} className="qr-card border-2 border-manager-primary rounded-xl p-6 text-center bg-white">
            <p className="text-xs font-semibold text-manager-primary uppercase tracking-wider mb-2">
              Taman Margasatwa Ragunan
            </p>
            <h3 className="text-xl font-bold text-manager-primary mb-1">
              {animal.name}
            </h3>
            <p className="text-sm text-muted-foreground italic mb-4">
              {animal.latin_name}
            </p>
            
            <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-manager-border">
              <QRCodeSVG
                id={`qr-svg-${animal.id}`}
                value={qrUrl}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#1B5E20"
              />
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Scan untuk informasi lengkap
            </p>
            
            {animal.location && (
              <p className="text-sm font-medium text-manager-primary mt-3 px-3 py-2 bg-manager-primary/10 rounded-lg inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-manager-primary shrink-0" />
                <span>{animal.location}</span>
              </p>
            )}
          </div>

          {/* URL Info */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">URL yang dikodekan:</p>
            <p className="text-sm font-mono text-manager-primary break-all">{qrUrl}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-manager-border bg-muted/50 flex gap-3">
          <Button 
            onClick={handleDownload}
            variant="outline" 
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
          <Button 
            onClick={handlePrint}
            className="flex-1 gap-2 bg-manager-primary hover:bg-manager-primary/90"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
        </div>
      </div>
    </div>
  );
}
