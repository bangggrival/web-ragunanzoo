"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Utensils, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeedingItem {
  id: string;
  time: string;
  animalName: string;
  location: string;
  zone?: string;
  isSpecial?: boolean;
}

const DEFAULT_SCHEDULE: FeedingItem[] = [
  { id: '1', time: '09:30', animalName: 'Harimau Sumatera', location: 'Kandang Khusus Karnivora', zone: 'Zona Mamalia' },
  { id: '2', time: '11:00', animalName: 'Orangutan & Primata', location: 'Pusat Primata Schmutzer', zone: 'Schmutzer', isSpecial: true },
  { id: '3', time: '13:30', animalName: 'Gajah Sumatera', location: 'Kawasan Konservasi Gajah', zone: 'Zona Herbivora' },
  { id: '4', time: '15:00', animalName: 'Komodo Dragon', location: 'Taman Reptil & Amfibi', zone: 'Zona Reptil', isSpecial: true },
];

export default function LiveFeedingTimeline() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Format current HH:mm
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next feeding item
  const scheduleWithStatus = useMemo(() => {
    return DEFAULT_SCHEDULE.map(item => {
      const [h, m] = item.time.split(':').map(Number);
      const itemMinutes = h * 60 + m;
      const diff = itemMinutes - currentMinutes;

      let status: 'completed' | 'ongoing' | 'upcoming' = 'upcoming';
      let diffText = '';

      if (diff < -30) {
        status = 'completed';
      } else if (diff <= 0 && diff >= -30) {
        status = 'ongoing';
      } else {
        status = 'upcoming';
        if (diff < 60) {
          diffText = `${diff} mnt lagi`;
        } else {
          const hours = Math.floor(diff / 60);
          const mins = diff % 60;
          diffText = `${hours}j ${mins}m lagi`;
        }
      }

      return {
        ...item,
        status,
        diff,
        diffText,
      };
    });
  }, [currentMinutes]);

  const nextUpcoming = scheduleWithStatus.find(s => s.status === 'ongoing' || s.status === 'upcoming');

  return (
    <div className="bg-card rounded-3xl border border-border p-6 space-y-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-none">Jadwal Feeding & Atraksi</h3>
              <p className="text-xs text-muted-foreground mt-1">Jadwal atraksi makan satwa hari ini</p>
            </div>
          </div>

          <Link
            href="/manager/feeding-schedules"
            className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-0.5 group"
          >
            Kelola
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Live Next Banner */}
        {nextUpcoming && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 badge-live-pulse flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 block">
                  {nextUpcoming.status === 'ongoing' ? 'Sedang Berlangsung Sekarang' : 'Sesi Feeding Berikutnya'}
                </span>
                <span className="text-xs font-bold text-foreground truncate block">
                  {nextUpcoming.animalName} ({nextUpcoming.time} WIB)
                </span>
              </div>
            </div>

            {nextUpcoming.diffText && (
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-500 text-white shadow-sm flex-shrink-0">
                {nextUpcoming.diffText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline Items */}
      <div className="space-y-2.5 my-1">
        {scheduleWithStatus.map((item) => {
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border transition-all text-xs",
                item.status === 'ongoing'
                  ? "bg-amber-500/10 border-amber-500/40 text-foreground font-semibold"
                  : item.status === 'completed'
                  ? "bg-muted/30 border-border/40 text-muted-foreground opacity-75"
                  : "bg-muted/40 border-border/60 text-foreground"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 font-bold font-mono text-xs flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{item.time}</span>
                </div>

                <div className="min-w-0">
                  <p className={cn("font-bold truncate text-xs", item.status === 'completed' && "line-through")}>
                    {item.animalName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.status === 'completed' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Selesai
                  </span>
                ) : item.status === 'ongoing' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.diffText || 'Akan Datang'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Semua Keeper Terjadwal
        </span>
        <Link href="/manager/events" className="text-primary hover:underline font-bold text-[11px]">
          Lihat Kalender Event
        </Link>
      </div>
    </div>
  );
}
