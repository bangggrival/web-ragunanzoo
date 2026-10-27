import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { GpsPoi } from '../types';

interface GpsAnalyticsTabProps {
  pois: GpsPoi[];
}

export function GpsAnalyticsTab({ pois }: GpsAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Total Titik Lokasi</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><AppIcon icon="MapPin" className="w-5 h-5" /></span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pois.length}</div>
          <div className="text-xs text-gray-500">Satwa dan fasilitas terdaftar</div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Satwa / Fauna</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl"><AppIcon icon="Utensils" className="w-5 h-5" /></span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pois.filter(p => p.category === 'animal').length}</div>
          <div className="text-xs text-gray-500">Dengan atraksi feeding & edukasi</div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Fasilitas Publik</span>
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl"><AppIcon icon="Bath" className="w-5 h-5" /></span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pois.filter(p => p.category !== 'animal').length}</div>
          <div className="text-xs text-gray-500">Toilet, musholla, loket, kuliner</div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-[2rem] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Zona Ditutup</span>
            <span className="p-2 bg-red-100 text-red-700 rounded-xl"><AppIcon icon="AlertTriangle" className="w-5 h-5" /></span>
          </div>
          <div className="text-3xl font-bold text-red-600">{pois.filter(p => p.is_temporarily_closed).length}</div>
          <div className="text-xs text-gray-500">Sedang dalam pemeliharaan</div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <AppIcon icon="Info" className="w-5 h-5 text-emerald-600" />
          Panduan Sistem Koordinat GPS Peta Ragunan & Crowd Heatmap
        </h3>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            <b>1. Sistem Proyeksi:</b> Seluruh koordinat disimpan dalam format <b>WGS84 (EPSG:4326)</b> dengan Latitude dan Longitude standar GPS. Ragunan berada di kisaran Latitude <code>-6.3080</code> s.d. <code>-6.3180</code> dan Longitude <code>106.8140</code> s.d. <code>106.8280</code>.
          </p>
          <p>
            <b>2. Geo-Fence Guard:</b> Sistem secara otomatis menolak input koordinat yang berada di luar batas perimeter resmi kawasan Taman Margasatwa Ragunan untuk menjaga validitas data spasial dan mencegah serangan manipulasi data.
          </p>
          <p>
            <b>3. Visualizer Heatmap Kepadatan:</b> Lapisan warna panas (Heatmap) dihitung secara real-time dari akumulasi log check-in pengunjung, pencarian rute GPS aktif, laporan kerusakan fasilitas, dan satwa dengan status kapasitas padat.
          </p>
          <p>
            <b>4. Deteksi Dini Penumpukan Massa:</b> Jika akumulasi intensitas di suatu zona melebihi ambang batas kritis, sistem akan memunculkan Crowd Alert otomatis agar tim operasional dapat mengurai antrean atau mengalihkan arus rute kereta wisata.
          </p>
        </div>
      </div>
    </div>
  );
}
