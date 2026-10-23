import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const backendProxyUrl = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5005';
  const backendUrl = `${backendProxyUrl}/api/realtime`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      signal: request.signal,
    });

    if (!response.ok) {
      return new Response(`Failed to connect to backend SSE: ${response.statusText}`, { status: 500 });
    }

    // Return the response directly to stream it without buffering
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('aborted') || error.cause?.code === 'UND_ERR_SOCKET') {
      return new Response(null, { status: 204 });
    }
    console.error('[Next.js SSE Proxy] Error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

