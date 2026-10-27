"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonStatCard } from '@/components/ui/skeleton';
import DashboardAnalyticsChart from '@/components/manager/DashboardAnalyticsChart';
import LiveFeedingTimeline from '@/components/manager/LiveFeedingTimeline';
import QuickActivityFeed from '@/components/manager/QuickActivityFeed';
import SystemHealthCard from '@/components/manager/SystemHealthCard';
import { cn } from '@/lib/utils';

export default function ManagerDashboard() {
  const { stats, loading } = useDashboardStats();
  const { user } = useAuth();

  // Dynamic time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const displayName = user?.email?.split('@')[0] || user?.username || user?.name || 'Admin';

  // Park open/close operational status
  const isParkOpen = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 16;
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-32 rounded-3xl bg-card border border-border shimmer-card" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-6 h-80 shimmer-card" />
          <div className="bg-card rounded-3xl border border-border p-6 h-80 shimmer-card" />
        </div>
      </div>
    );
  }

  // Health ratio for animals
  const healthPercent = stats.totalAnimals > 0 
    ? Math.round((stats.healthyAnimals / stats.totalAnimals) * 100) 
    : 100;

  return (
    <div className="animate-fade-in space-y-6 pb-6">
      {/* ===================== HERO GREETING BANNER ===================== */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/90 via-teal-950/80 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <AppIcon icon="Sparkles" className="w-3.5 h-3.5 text-emerald-300" />
                Pusat Kendali Operasional
              </span>

              {/* Park Operational Status Pill */}
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
                isParkOpen 
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300" 
                  : "bg-amber-500/20 border-amber-400/40 text-amber-300"
              )}>
                <span className={cn("w-2 h-2 rounded-full", isParkOpen ? "bg-emerald-400 badge-live-pulse" : "bg-amber-400")} />
                {isParkOpen ? 'Taman Terbuka • 06:00 - 16:00 WIB' : 'Taman Tutup • Buka Besok 06:00 WIB'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center flex-wrap gap-2">
              <span>{greeting}, <span className="text-emerald-400">{displayName}</span>!</span>
              <AppIcon icon="Leaf" className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0 inline-block" />
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau status koleksi satwa, flora, acara, permohonan PKL, dan analitik pengunjung Ragunan secara real-time.
            </p>
          </div>

          {/* Quick Action Shortcut Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/manager/animals"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all backdrop-blur-md btn-interactive"
            >
              <AppIcon icon="Plus" className="w-3.5 h-3.5 text-emerald-400" />
              Kelola Satwa
            </Link>

            <Link
              href="/fauna"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all btn-interactive"
            >
              Lihat Website Publik
              <AppIcon icon="ArrowUpRight" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== 6 KPI METRIC STAT CARDS ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Koleksi Satwa */}
        <Link href="/manager/animals" className="group">
          <div className="p-4 rounded-3xl bg-card border border-border/80 glass-card-hover h-full flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Koleksi Satwa</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AppIcon icon="PawPrint" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-foreground">{stats.totalAnimals}</p>
              <div className="flex items-center justify-between text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                <span>{stats.healthyAnimals} Sehat</span>
                <span className="font-bold">{healthPercent}%</span>
              </div>
              {/* Mini Health Progress Bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${healthPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Koleksi Flora */}
        <Link href="/manager/plants" className="group">
          <div className="p-4 rounded-3xl bg-card border border-border/80 glass-card-hover h-full flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Koleksi Flora</span>
              <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AppIcon icon="Leaf" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-foreground">{stats.totalPlants}</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
                Pohon & Tanaman Langka
              </p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-teal-500 rounded-full w-4/5" />
              </div>
            </div>
          </div>
        </Link>

        {/* Acara & Show */}
        <Link href="/manager/events" className="group">
          <div className="p-4 rounded-3xl bg-card border border-border/80 glass-card-hover h-full flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Acara & Show</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AppIcon icon="Calendar" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-foreground">{stats.totalEvents}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                Feeding Show & Atraksi
              </p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-amber-500 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </Link>

        {/* Berita Publik */}
        <Link href="/manager/news" className="group">
          <div className="p-4 rounded-3xl bg-card border border-border/80 glass-card-hover h-full flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Berita Publik</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AppIcon icon="Newspaper" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-foreground">{stats.totalNews}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                Artikel & Pengumuman
              </p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-blue-500 rounded-full w-2/3" />
              </div>
            </div>
          </div>
        </Link>

        {/* Layanan & WBS */}
        <Link href="/manager/service-registrations" className="group">
          <div className="p-4 rounded-3xl bg-card border border-border/80 glass-card-hover h-full flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Layanan & WBS</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AppIcon icon="FileText" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-foreground">
                {stats.totalRegistrations + stats.totalWbs}
              </p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 truncate">
                Permohonan & Aduan
              </p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-indigo-500 rounded-full w-1/2" />
              </div>
            </div>
          </div>
        </Link>

        {/* Trafik Website */}
        <Link href="/manager/website-analytics" className="group">
          <div className="p-4 rounded-3xl bg-card border border-border/80 glass-card-hover h-full flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Trafik Website</span>
              <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AppIcon icon="Eye" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-foreground">{stats.totalPageViews}</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                Tayangan Halaman
              </p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-rose-500 rounded-full w-5/6" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ===================== INTERACTIVE ANALYTICS & LIVE TIMELINE ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recharts Analytics Chart */}
        <div className="lg:col-span-2">
          <DashboardAnalyticsChart totalViews={stats.totalPageViews} />
        </div>

        {/* Right 1 Col: Live Feeding Schedule & Countdown Timeline */}
        <div className="lg:col-span-1">
          <LiveFeedingTimeline />
        </div>
      </div>

      {/* ===================== QUICK ACTIONS & SHORTCUT LAUNCHER ===================== */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-foreground">Aksi & Pengelolaan Cepat</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Akses langsung modul manajemen yang paling sering digunakan
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-muted-foreground">
            <AppIcon icon="Sparkles" className="w-3.5 h-3.5 text-primary" />
            Pintasan Cepat
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {/* Kelola Satwa */}
          <Link
            href="/manager/animals"
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 hover:border-emerald-500/40 transition-all group btn-interactive"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-2xs">
              <AppIcon icon="PawPrint" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Kelola Satwa</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">Tambah/edit spesies & info nutrisi</p>
            </div>
            <AppIcon icon="ChevronRight" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Kelola Flora */}
          <Link
            href="/manager/plants"
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 hover:border-teal-500/40 transition-all group btn-interactive"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-2xs">
              <AppIcon icon="Leaf" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Kelola Flora</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">Katalog pohon & konservasi botani</p>
            </div>
            <AppIcon icon="ChevronRight" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Jadwal Makan */}
          <Link
            href="/manager/feeding-schedules"
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 hover:border-amber-500/40 transition-all group btn-interactive"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-2xs">
              <AppIcon icon="Utensils" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Jadwal Makan</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">Feeding show satwa & atraksi keeper</p>
            </div>
            <AppIcon icon="ChevronRight" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Tarif & Tiket */}
          <Link
            href="/manager/tickets"
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 hover:border-purple-500/40 transition-all group btn-interactive"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-2xs">
              <AppIcon icon="Ticket" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Tarif & Tiket</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">Harga tiket masuk, wahana & JakCard</p>
            </div>
            <AppIcon icon="ChevronRight" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Permohonan PKL */}
          <Link
            href="/manager/service-registrations"
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 hover:border-indigo-500/40 transition-all group btn-interactive"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-2xs">
              <AppIcon icon="FileText" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Permohonan PKL/Riset</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">Verifikasi berkas & status magang</p>
            </div>
            <AppIcon icon="ChevronRight" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* Pengaturan Sistem */}
          <Link
            href="/manager/system-configs"
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 hover:border-sky-500/40 transition-all group btn-interactive"
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-2xs">
              <AppIcon icon="Compass" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Pengaturan Sistem</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">Maintenance mode, chatbot & cache</p>
            </div>
            <AppIcon icon="ChevronRight" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* ===================== ACTIVITY FEED & SYSTEM HEALTH ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Audit Feed */}
        <QuickActivityFeed />

        {/* System Health & Security Status Card */}
        <SystemHealthCard />
      </div>
    </div>
  );
}
