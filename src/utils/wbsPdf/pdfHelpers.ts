import type { jsPDF } from 'jspdf';

type OptimizeOptions = {
  maxWidth: number;
  maxHeight: number;
  /** 0..1 */
  quality?: number;
  /** default: 'image/jpeg' */
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
};

// Convert image URL to base64 with improved error handling and CORS support
export async function imageToBase64(url: string): Promise<string | null> {
  if (!url) return null;
  
  try {
    // Try fetching with CORS mode first
    const response = await fetch(url, { 
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const blob = await response.blob();
    
    // Validate that it's actually an image
    if (!blob.type.startsWith('image/')) {
      console.warn(`URL is not an image: ${blob.type}`);
      return null;
    }
    
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Validate base64 result
        if (result && result.startsWith('data:image/')) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error converting image to base64:', error);
    return null;
  }
}

/**
 * Downscale/compress a data URL image to reduce PDF size.
 * This runs in the browser (Canvas) and returns the original if it can't optimize.
 */
export async function optimizeImageDataUrl(
  dataUrl: string,
  { maxWidth, maxHeight, quality = 0.75, mimeType = 'image/jpeg' }: OptimizeOptions
): Promise<string> {
  if (!dataUrl?.startsWith('data:image/')) return dataUrl;

  try {
    const img = new Image();
    img.decoding = 'async';

    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });

    if (!loaded) return dataUrl;

    const srcW = img.naturalWidth || (img as any).width;
    const srcH = img.naturalHeight || (img as any).height;
    if (!srcW || !srcH) return dataUrl;

    const scale = Math.min(1, maxWidth / srcW, maxHeight / srcH);
    const outW = Math.max(1, Math.round(srcW * scale));
    const outH = Math.max(1, Math.round(srcH * scale));

    // If already small enough, keep original
    if (scale === 1 && dataUrl.length < 350_000) return dataUrl;

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    // Fill with white background to avoid black areas when converting PNG with transparency to JPEG
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outW, outH);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, outW, outH);

    const optimized = canvas.toDataURL(mimeType, quality);
    // Only use optimized if it actually reduced size
    return optimized && optimized.length < dataUrl.length ? optimized : dataUrl;
  } catch {
    return dataUrl;
  }
}

export function getImageFormatFromDataUrl(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (!dataUrl) return 'JPEG';
  if (dataUrl.includes('image/png')) return 'PNG';
  if (dataUrl.includes('image/webp')) return 'WEBP';
  return 'JPEG';
}

export function addTextWatermark(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  watermarkText: string
) {
  try {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(220, 220, 220);
    doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 35,
    } as any);
  } catch (error) {
    console.warn('Error adding watermark:', error);
  }
}
