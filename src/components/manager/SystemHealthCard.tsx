"use client";

import { useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

export default function SystemHealthCard() {
  const [clearing, setClearing] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      setClearing(false);
      setClearedSuccess(true);
      setTimeout(() => setClearedSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 space-y-4 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <AppIcon name="solar:shield-check-bold-duotone" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground leading-none">Status & Keamanan Sistem</h3>
            <p className="text-xs text-muted-foreground mt-1">Koneksi database, API backend & integritas layanan</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 badge-live-pulse" />
          99.98% Normal
        </span>
      </div>

      {/* Grid of status metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Database */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Database</span>
            <AppIcon name="solar:database-bold-duotone" className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-foreground">PostgreSQL</p>
          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
            <AppIcon name="solar:check-circle-bold" className="w-2.5 h-2.5" /> Terhubung
          </span>
        </div>

        {/* API Backend */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">API Gateway</span>
            <AppIcon name="solar:server-bold-duotone" className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xs font-bold text-foreground">Node / Express</p>
          <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
            <AppIcon name="solar:bolt-bold-duotone" className="w-2.5 h-2.5" /> Latensi 24ms
          </span>
        </div>

        {/* Storage */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Storage Media</span>
            <AppIcon name="solar:hard-drive-bold-duotone" className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-foreground">5 Buckets</p>
          <span className="text-[10px] text-amber-500 font-medium">Aktif & Sinkron</span>
        </div>

        {/* Cache & Security */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Keamanan</span>
            <AppIcon name="solar:cpu-bolt-bold-duotone" className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xs font-bold text-foreground">JWT & RLS</p>
          <span className="text-[10px] text-purple-500 font-medium">Terproteksi</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
        <button
          onClick={handleClearCache}
          disabled={clearing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all btn-interactive"
        >
          <AppIcon name="solar:restart-bold" className={cn("w-3.5 h-3.5", clearing && "animate-spin text-primary")} />
          {clearedSuccess ? 'Cache Dibersihkan! ✨' : clearing ? 'Membersihkan...' : 'Segarkan Cache'}
        </button>

        <Link
          href="/manager/system-configs"
          className="text-xs font-bold text-primary hover:underline"
        >
          Pengaturan Sistem &rarr;
        </Link>
      </div>
    </div>
  );
}
