"use client";

import { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

interface AnalyticsChartProps {
  totalViews?: number;
}

export default function DashboardAnalyticsChart({ totalViews = 155 }: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [metric, setMetric] = useState<'views' | 'interactions'>('views');

  // Generate realistic 7-day trend data anchored on current totalViews
  const chartData = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const base = Math.max(15, Math.floor(totalViews / 7));
    
    return days.map((day, idx) => {
      // Weekend multiplier
      const isWeekend = idx >= 5;
      const factor = isWeekend ? 1.85 : 0.95 + (idx * 0.12);
      const views = Math.round(base * factor + Math.sin(idx) * 4);
      const interactions = Math.round(views * 0.42);

      return {
        name: day,
        views: Math.max(8, views),
        interactions: Math.max(3, interactions),
      };
    });
  }, [totalViews]);

  const totalRangeViews = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.views, 0);
  }, [chartData]);

  const peakViews = useMemo(() => {
    return Math.max(...chartData.map(d => d.views));
  }, [chartData]);

  return (
    <div className="bg-card rounded-3xl border border-border p-6 space-y-5 shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-foreground">Tren Trafik & Pengunjung</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <AppIcon name="solar:chart-2-bold" className="w-3 h-3" />
              +14.2% minggu ini
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analisis tayangan portal Ragunan Explorer dalam 7 hari terakhir
          </p>
        </div>

        {/* Filter Metric Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/50 self-start sm:self-auto">
          <button
            onClick={() => setMetric('views')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              metric === 'views'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AppIcon name="solar:eye-bold-duotone" className="w-3.5 h-3.5" />
            Tayangan
          </button>
          <button
            onClick={() => setMetric('interactions')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              metric === 'interactions'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AppIcon name="solar:users-group-two-rounded-bold-duotone" className="w-3.5 h-3.5" />
            Interaksi
          </button>
        </div>
      </div>

      {/* Mini Stats Highlight */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground">Total Mingguan</span>
          <p className="text-lg font-black text-foreground mt-0.5">{totalRangeViews} tayangan</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground">Rata-rata / Hari</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {Math.round(totalRangeViews / 7)}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground">Puncak (Weekend)</span>
          <p className="text-lg font-black text-amber-500 mt-0.5">{peakViews}</p>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="h-60 sm:h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-300">{label} ini</p>
                      <div className="flex items-center gap-2 font-semibold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {metric === 'views' ? 'Tayangan' : 'Interaksi'}: {payload[0].value}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={metric === 'views' ? '#10b981' : '#06b6d4'}
              strokeWidth={3}
              fillOpacity={1}
              fill={metric === 'views' ? 'url(#emeraldGradient)' : 'url(#tealGradient)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
