

export interface GpsPoi {
  id: string;
  name: string;
  name_en?: string | null;
  category: string; // animal, toilet, musholla, tram, ticket, kuliner, medical
  lat: number;
  lng: number;
  color?: string | null;
  emoji?: string | null;
  description?: string | null;
  description_en?: string | null;
  is_active: boolean;
  is_temporarily_closed?: boolean;
  closure_reason?: string | null;
  closure_until?: string | null;
  feeding_time?: string | null;
  feeding_time_hour?: number | null;
  feeding_time_minute?: number | null;
  feeding_note?: string | null;
  operating_hours_open?: string | null;
  operating_hours_close?: string | null;
  capacity_status?: 'normal' | 'padat' | 'sepi';
  local_announcement?: string | null;
  announcement_expires_at?: string | null;
  latin_name?: string | null;
  conservation_status?: string | null;
  origin?: string | null;
  diet?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TramRoutePoint {
  id: number;
  sequence_order: number;
  lat: number;
  lng: number;
  halt_name?: string | null;
  is_halt: boolean;
  is_active: boolean;
}

export interface CategoryOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'Semua Kategori', icon: 'solar:layers-bold-duotone', color: '#4b5563' },
  { value: 'animal', label: 'Satwa / Fauna', icon: 'fluent-emoji-flat:lion', color: '#16a34a' },
  { value: 'toilet', label: 'Toilet & Sanitasi', icon: 'solar:bath-bold-duotone', color: '#0284c7' },
  { value: 'musholla', label: 'Musholla & Ibadah', icon: 'solar:city-bold-duotone', color: '#059669' },
  { value: 'tram', label: 'Halte Kereta Wisata', icon: 'solar:bus-bold-duotone', color: '#ca8a04' },
  { value: 'ticket', label: 'Pintu Masuk & Loket', icon: 'solar:ticket-bold-duotone', color: '#15803d' },
  { value: 'kuliner', label: 'Pujasera & Kafe', icon: 'solar:cup-hot-bold-duotone', color: '#d97706' },
  { value: 'medical', label: 'Pos Medis & P3K', icon: 'solar:health-bold-duotone', color: '#dc2626' }
];

export const PRESET_COLORS = [
  '#22c55e', '#16a34a', '#1b4332', '#0284c7', '#059669',
  '#f59e0b', '#d97706', '#b85032', '#dc2626', '#9333ea'
];
