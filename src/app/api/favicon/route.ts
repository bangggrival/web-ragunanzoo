import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/favicon
 *
 * Dynamically serves the official favicon directly from the database (site_settings.favicon_url).
 * If site_settings has a custom uploaded favicon, it reads and streams the exact image.
 * This guarantees 100% dynamic favicon synchronized with the database.
 */
export async function GET(request: Request) {
  try {
    const backendUrl =
      process.env.INTERNAL_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://127.0.0.1:5005';

    // 1. Fetch site_settings from database
    const dbRes = await fetch(`${backendUrl}/api/db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'site_settings',
        action: 'select',
        filters: [{ type: 'eq', column: 'id', value: 'main' }],
        limit: 1,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (dbRes.ok) {
      const json = await dbRes.json();
      const settings = json?.data?.[0];
      const faviconPath = settings?.favicon_url || settings?.logo_url || settings?.loading_logo_url;

      if (faviconPath) {
        // If it's a local upload path, attempt to read directly from server/uploads
        if (faviconPath.startsWith('/uploads/') || faviconPath.startsWith('uploads/')) {
          const relativeUploadPath = faviconPath.replace(/^\/?uploads\//, '');
          const localFilePath = path.join(process.cwd(), 'server', 'uploads', relativeUploadPath);

          if (fs.existsSync(localFilePath)) {
            const buffer = fs.readFileSync(localFilePath);
            const ext = path.extname(localFilePath).toLowerCase();
            const contentType = ext === '.ico' ? 'image/x-icon' : ext === '.svg' ? 'image/svg+xml' : 'image/png';

            return new Response(buffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              },
            });
          }

          // If file not locally mounted, fetch through backend proxy URL
          const remoteUrl = `${backendUrl}/${faviconPath.replace(/^\//, '')}`;
          const imgRes = await fetch(remoteUrl);
          if (imgRes.ok) {
            const imgBuffer = await imgRes.arrayBuffer();
            return new Response(imgBuffer, {
              status: 200,
              headers: {
                'Content-Type': imgRes.headers.get('content-type') || 'image/png',
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              },
            });
          }
        } else if (faviconPath.startsWith('http://') || faviconPath.startsWith('https://')) {
          const imgRes = await fetch(faviconPath);
          if (imgRes.ok) {
            const imgBuffer = await imgRes.arrayBuffer();
            return new Response(imgBuffer, {
              status: 200,
              headers: {
                'Content-Type': imgRes.headers.get('content-type') || 'image/png',
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[FAVICON API] Error fetching favicon from database:', err);
  }

  // Fallback: Read official database logo from uploads or public/favicon.png
  const fallbackLogoPath = path.join(process.cwd(), 'server', 'uploads', 'branding', 'logo', 'logo-1769473779191.png');
  if (fs.existsSync(fallbackLogoPath)) {
    const buffer = fs.readFileSync(fallbackLogoPath);
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60, s-maxage=3600',
      },
    });
  }

  const publicFaviconPath = path.join(process.cwd(), 'public', 'favicon.png');
  if (fs.existsSync(publicFaviconPath)) {
    const buffer = fs.readFileSync(publicFaviconPath);
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60, s-maxage=3600',
      },
    });
  }

  return new Response(null, { status: 404 });
}
