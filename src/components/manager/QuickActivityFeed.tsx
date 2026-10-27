"use client";

import { useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'animal' | 'service' | 'news' | 'ticket' | 'system';
  title: string;
  desc: string;
  timeAgo: string;
  user: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'animal',
    title: 'Pembaruan Data Satwa',
    desc: 'Status kesehatan Harimau Sumatera diperbarui: Sehat & Nutrisi Terpenuhi',
    timeAgo: '5 mnt lalu',
    user: 'admin_rival'
  },
  {
    id: '2',
    type: 'service',
    title: 'Permohonan PKL Baru',
    desc: 'Pengajuan magang biologi dari Universitas Indonesia diterima di antrean',
    timeAgo: '28 mnt lalu',
    user: 'Sistem Registrasi'
  },
  {
    id: '3',
    type: 'news',
    title: 'Artikel Berita Diterbitkan',
    desc: 'Program Konservasi Flora Langka Ragunan 2026 berhasil dipublikasi',
    timeAgo: '2 jam lalu',
    user: 'admin_rival'
  },
  {
    id: '4',
    type: 'ticket',
    title: 'Sinkronisasi Tarif Tiket',
    desc: 'Ketentuan dan paket wahana Schmutzer berhasil disinkronkan',
    timeAgo: '4 jam lalu',
    user: 'admin_rival'
  },
];

export default function QuickActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getIconAndColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'animal':
        return { icon: 'fluent-emoji-flat:paw-prints', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
      case 'service':
        return { icon: 'solar:document-text-bold-duotone', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' };
      case 'news':
        return { icon: 'solar:document-add-bold-duotone', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
      case 'ticket':
        return { icon: 'solar:ticket-sale-bold-duotone', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' };
      default:
        return { icon: 'solar:stars-minimalistic-bold-duotone', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' };
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 space-y-4 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <AppIcon name="solar:history-bold-duotone" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground leading-none">Aktivitas Terkini</h3>
            <p className="text-xs text-muted-foreground mt-1">Audit log pembaruan sistem dan operasional</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Segarkan aktivitas"
        >
          <AppIcon name="solar:restart-bold" className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary")} />
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3 my-1">
        {activities.map((item) => {
          const { icon: iconName, bg } = getIconAndColor(item.type);
          return (
            <div key={item.id} className="flex items-start gap-3 group">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", bg)}>
                <AppIcon name={iconName} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                    {item.timeAgo}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.desc}</p>
                <span className="text-[10px] text-primary/80 font-medium">oleh {item.user}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
          <AppIcon name="solar:check-circle-bold" className="w-3.5 h-3.5" />
          Audit Trail Aktif
        </span>
        <Link href="/manager/system-configs" className="text-primary hover:underline font-bold text-[11px]">
          Log Lengkap
        </Link>
      </div>
    </div>
  );
}
