'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get('sb-token')?.value ||
    cookieStore.get('auth_token')?.value ||
    cookieStore.get('access_token')?.value ||
    null
  );
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'API error');
  return json;
}

// ── GPS POIs ──────────────────────────────────────────────────

export async function getGpsPoisAction(params?: { category?: string; active_only?: string }) {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/gps-pois${qs ? '?' + qs : ''}`);
}

export async function createGpsPoiAction(data: Record<string, any>) {
  return apiFetch('/api/gps-pois', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateGpsPoiAction(id: string, data: Record<string, any>) {
  return apiFetch(`/api/gps-pois/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteGpsPoiAction(id: string) {
  return apiFetch(`/api/gps-pois/${id}`, { method: 'DELETE' });
}

export async function updatePoiClosureAction(
  id: string,
  data: { is_temporarily_closed: boolean; closure_reason?: string; closure_until?: string }
) {
  return apiFetch(`/api/gps-pois/${id}/closure`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function updatePoiCapacityAction(id: string, capacity_status: 'normal' | 'padat' | 'sepi') {
  return apiFetch(`/api/gps-pois/${id}/capacity`, { method: 'PATCH', body: JSON.stringify({ capacity_status }) });
}

export async function updatePoiAnnouncementAction(
  id: string,
  data: { local_announcement: string; announcement_expires_at?: string }
) {
  return apiFetch(`/api/gps-pois/${id}/announcement`, { method: 'PATCH', body: JSON.stringify(data) });
}

// ── Tram Route ────────────────────────────────────────────────

export async function getTramRouteAction() {
  return apiFetch('/api/tram-route');
}

export async function createTramPointAction(data: { lat: number; lng: number; halt_name?: string; is_halt?: boolean }) {
  return apiFetch('/api/tram-route', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTramPointAction(id: number, data: Record<string, any>) {
  return apiFetch(`/api/tram-route/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTramPointAction(id: number) {
  return apiFetch(`/api/tram-route/${id}`, { method: 'DELETE' });
}

export async function reorderTramRouteAction(order: Array<{ id: number; sequence_order: number }>) {
  return apiFetch('/api/tram-route/bulk/reorder', { method: 'PUT', body: JSON.stringify({ order }) });
}
