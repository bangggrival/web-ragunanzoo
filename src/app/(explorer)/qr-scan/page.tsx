"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5QrcodeResult } from 'html5-qrcode';
import { AppIcon } from '@/components/ui/AppIcon';
import QRScanner from '@/components/qr/QRScanner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function QRScan() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; animalId?: number } | null>(null);

  const handleScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
    const formatName = result.result.format?.formatName || 'Unknown';
    console.log('Code scanned:', decodedText, 'Format:', formatName);

    // Try to parse the scanned code
    // Expected formats:
    // 1. Full URL: https://domain.com/animals/123 or https://domain.com/explorer/animals/123
    // 2. Path: /animals/123 or /explorer/animals/123
    // 3. Just ID: 123
    // 4. Prefixed ID: ANIMAL-123, RGN-123, etc.

    let animalId: number | null = null;

    // Try full URL or path - support both /animals/ and /explorer/animals/
    const urlMatch = decodedText.match(/\/(?:explorer\/)?animals\/(\d+)/);
    if (urlMatch) {
      animalId = parseInt(urlMatch[1]);
    } else {
      // Try prefixed format (e.g., ANIMAL-123, RGN-123)
      const prefixMatch = decodedText.match(/(?:ANIMAL|RGN|SATWA|ZOO)[-_]?(\d+)/i);
      if (prefixMatch) {
        animalId = parseInt(prefixMatch[1]);
      } else {
        // Try just number
        const numMatch = decodedText.match(/^(\d+)$/);
        if (numMatch) {
          animalId = parseInt(numMatch[1]);
        }
      }
    }

    if (animalId) {
      setScanResult({
        success: true,
        message: `Satwa ditemukan! ID: ${animalId} (${formatName})`,
        animalId,
      });
      toast.success(`${formatName} berhasil dipindai!`);
      
      // Navigate after a short delay - use new route structure
      setTimeout(() => {
        router.push(`/animals/${animalId}`);
      }, 1000);
    } else {
      // Show what was scanned even if not recognized
      setScanResult({
        success: false,
        message: `Kode tidak dikenali: "${decodedText.substring(0, 50)}${decodedText.length > 50 ? '...' : ''}" (${formatName})`,
      });
      toast.error('Kode tidak dikenali sebagai satwa');
    }
  };

  const handleClose = () => {
    setShowScanner(false);
    setScanResult(null);
  };

  return (
    <>
      {/* QR Scanner Modal - Full Screen */}
      {showScanner && (
        <QRScanner onScanSuccess={handleScanSuccess} onClose={handleClose} />
      )}

    <div className="animate-fade-in min-h-screen bg-background">

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <AppIcon icon="QrCode" className="w-6 h-6 md:w-8 md:h-8" />
            <h1 className="text-xl md:text-3xl font-bold">Scan QR Satwa</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm md:text-base">
            Pindai QR Code di kandang untuk info lengkap
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-md mx-auto">
          {/* Scanner Button */}
          <div className="explorer-card p-6 md:p-8 text-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AppIcon icon="QrCode" className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
            
            <h2 className="text-lg md:text-xl font-bold mb-2">Pindai QR Code</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              Setiap kandang satwa dilengkapi dengan QR Code. Pindai untuk melihat informasi lengkap tentang satwa tersebut.
            </p>

            <Button 
              onClick={() => setShowScanner(true)} 
              className="w-full py-6 text-base md:text-lg gap-3"
              size="lg"
            >
              <AppIcon icon="Camera" className="w-5 h-5 md:w-6 md:h-6" />
              Buka Kamera
            </Button>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className={`explorer-card p-4 md:p-6 mb-6 ${scanResult.success ? 'border-primary' : 'border-destructive'}`}>
              <div className="flex items-center gap-3">
                {scanResult.success ? (
                  <AppIcon icon="CheckCircle" className="w-6 h-6 text-primary flex-shrink-0" />
                ) : (
                  <AppIcon icon="XCircle" className="w-6 h-6 text-destructive flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${scanResult.success ? 'text-primary' : 'text-destructive'}`}>
                    {scanResult.success ? 'Berhasil!' : 'Gagal'}
                  </p>
                  <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                </div>
              </div>
              {scanResult.success && (
                <p className="text-xs text-muted-foreground mt-2">
                  Mengalihkan ke halaman satwa...
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="explorer-card p-4 md:p-6">
            <h3 className="font-semibold mb-4">Cara Menggunakan</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                <span>Tekan tombol "Buka Kamera" di atas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                <span>Izinkan akses kamera jika diminta</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                <span>Arahkan kamera ke QR Code di papan informasi kandang</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">4</span>
                <span>Otomatis terbuka halaman informasi satwa</span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
