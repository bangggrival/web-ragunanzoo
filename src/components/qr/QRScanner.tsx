import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeResult, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, result: Html5QrcodeResult) => void;
  onClose: () => void;
}

// All supported formats including QR codes and various barcodes
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.AZTEC,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.PDF_417,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
];

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isStoppingRef = useRef(false);
  const camerasRef = useRef<{ id: string; label: string }[]>([]);
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Cleanup scanner safely
  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    
    if (isMountedRef.current) {
      setIsScanning(false);
    }
    isStoppingRef.current = false;
  }, []);

  // Start scanner with camera
  const startScanner = useCallback(async (cameraId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      setIsInitializing(true);
      setError(null);
      
      // Stop existing scanner if any
      await stopScanner();

      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!isMountedRef.current) return;

      // Ensure the element exists
      const readerElement = document.getElementById('qr-reader');
      if (!readerElement) {
        console.error('QR reader element not found');
        setError('Gagal menginisialisasi scanner');
        setIsInitializing(false);
        return;
      }

      // Create new scanner instance with all barcode formats
      const scanner = new Html5Qrcode('qr-reader', {
        formatsToSupport: SUPPORTED_FORMATS,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });
      scannerRef.current = scanner;

      // Calculate optimal qrbox size based on viewport
      const viewportWidth = Math.min(window.innerWidth, 400);
      const qrboxWidth = Math.floor(viewportWidth * 0.7);
      const qrboxHeight = Math.floor(qrboxWidth * 0.7);

      const config = {
        fps: 15,
        qrbox: { width: qrboxWidth, height: qrboxHeight },
        aspectRatio: isIOS ? undefined : 1,
        disableFlip: false,
      };

      await scanner.start(
        cameraId,
        config,
        (decodedText, result) => {
          console.log('Code successfully scanned:', decodedText, 'Format:', result.result.format?.formatName);
          if (isMountedRef.current) {
            setLastScannedCode(decodedText);
            setHasScanned(true);
            onScanSuccess(decodedText, result);
            stopScanner();
          }
        },
        () => {
          // Silently ignore scan attempts that don't find codes
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setError(null);
        setIsInitializing(false);
      }
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      
      if (!isMountedRef.current) return;
      
      const errorMessage = err?.message || 'Gagal memulai kamera';
      if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
        setError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        setError('Tidak ada kamera yang ditemukan.');
      } else if (errorMessage.includes('NotReadableError') || errorMessage.includes('TrackStartError')) {
        setError('Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain dan coba lagi.');
      } else {
        setError('Gagal memulai kamera. Pastikan tidak ada aplikasi lain yang menggunakan kamera.');
      }
      setIsInitializing(false);
    }
  }, [stopScanner, onScanSuccess, isIOS]);

  // Initialize cameras on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    const initScanner = async () => {
      try {
        setIsInitializing(true);
        
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        console.log('Available cameras:', devices);
        
        if (!isMountedRef.current) return;
        
        if (devices && devices.length > 0) {
          setCameras(devices);
          camerasRef.current = devices;
          
          // Prefer back camera for QR scanning
          const backCameraIndex = devices.findIndex(
            (d) => 
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          const selectedIndex = backCameraIndex >= 0 ? backCameraIndex : 0;
          setCurrentCameraIndex(selectedIndex);
          
          // Start scanning with selected camera
          await startScanner(devices[selectedIndex].id);
        } else {
          setError('Tidak ada kamera yang tersedia');
          setIsInitializing(false);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        if (isMountedRef.current) {
          setError('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
          setIsInitializing(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const switchCamera = useCallback(async () => {
    if (camerasRef.current.length <= 1) return;
    const newIndex = (currentCameraIndex + 1) % camerasRef.current.length;
    setCurrentCameraIndex(newIndex);
    await startScanner(camerasRef.current[newIndex].id);
  }, [currentCameraIndex, startScanner]);

  const retryScanner = useCallback(async () => {
    setError(null);
    setHasScanned(false);
    
    if (camerasRef.current.length > 0) {
      await startScanner(camerasRef.current[currentCameraIndex].id);
    } else {
      // Re-fetch cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          camerasRef.current = devices;
          await startScanner(devices[0].id);
        } else {
          setError('Tidak ada kamera yang tersedia');
        }
      } catch (err) {
        setError('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
      }
    }
  }, [currentCameraIndex, startScanner]);

  // Function to scan again after a successful scan
  const scanAgain = useCallback(async () => {
    setHasScanned(false);
    setLastScannedCode(null);
    if (camerasRef.current.length > 0) {
      await startScanner(camerasRef.current[currentCameraIndex].id);
    }
  }, [currentCameraIndex, startScanner]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header with Close Button */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-all shadow-lg active:scale-95"
          aria-label="Tutup Scanner"
        >
          <AppIcon name="solar:close-circle-bold" className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold text-lg">Scan QR Code</h2>
        <div className="w-12" />
      </div>

      {/* Scanner View */}
      <div className="relative h-full flex items-center justify-center">
        <div 
          id="qr-reader" 
          className="w-full h-full"
          style={{ minHeight: '300px' }}
        />

        {/* Loading State */}
        {isInitializing && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center">
              <AppIcon name="solar:spinner-linear" className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-white">Memuat kamera...</p>
              <p className="text-white/60 text-sm mt-2">Pastikan izin kamera diberikan</p>
            </div>
          </div>
        )}

        {/* Overlay with scanning frame */}
        {isScanning && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning window */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

              {/* Scanning line animation */}
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center p-6 max-w-sm">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AppIcon name="solar:danger-triangle-bold-duotone" className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-white font-semibold mb-2">Kamera Tidak Tersedia</h3>
              <p className="text-white/70 text-sm mb-4">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={retryScanner} 
                  variant="outline" 
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Coba Lagi
                </Button>
                <Button 
                  onClick={onClose} 
                  variant="ghost" 
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scan Again Overlay - shows after successful scan */}
        {hasScanned && !isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-center p-6 max-w-sm">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AppIcon name="solar:camera-bold-duotone" className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-white font-semibold mb-2">Scan Berhasil!</h3>
              <p className="text-white/70 text-sm mb-4">
                {lastScannedCode && lastScannedCode.length > 30 
                  ? `${lastScannedCode.substring(0, 30)}...` 
                  : lastScannedCode}
              </p>
              <Button 
                onClick={scanAgain} 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Scan Lagi
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-8">
          {cameras.length > 1 && !hasScanned && (
            <button
              onClick={switchCamera}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            >
              <AppIcon name="solar:camera-rotate-bold-duotone" className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {!hasScanned && !error && (
          <p className="text-center text-white/70 text-sm mt-4">
            Arahkan kamera ke QR Code satwa
          </p>
        )}
      </div>
    </div>
  );
}
