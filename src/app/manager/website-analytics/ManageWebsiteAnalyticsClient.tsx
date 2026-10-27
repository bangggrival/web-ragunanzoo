"use client";

import { useState } from 'react';
import { useWebsiteAnalytics } from '@/hooks/useWebsiteAnalytics';
import { AppIcon } from '@/components/ui/AppIcon';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'];

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device) {
    case 'mobile':
      return <AppIcon icon="Smartphone" className="w-4 h-4" />;
    case 'tablet':
      return <AppIcon icon="Tablet" className="w-4 h-4" />;
    default:
      return <AppIcon icon="Monitor" className="w-4 h-4" />;
  }
};

export default function ManageWebsiteAnalyticsClient() {
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'traffic' | 'pages' | 'devices' | 'recent'>('traffic');
  const { data: analytics, isLoading, refetch, isRefetching } = useWebsiteAnalytics(days);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Memuat data analitik...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <AppIcon icon="BarChart3" className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">Tidak Ada Data</h3>
        <p className="text-slate-500 font-medium">Belum ada data analitik yang tersedia untuk periode ini.</p>
      </div>
    );
  }

  const chartData = analytics.viewsByDate.map(item => ({
    ...item,
    dateLabel: format(new Date(item.date), 'dd MMM', { locale: id })
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="LayoutTemplate" className="w-5 h-5 text-green-500" />
            </div>
            Website Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Statistik pengunjung dan traffic website real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[140px] h-11 bg-white/80 backdrop-blur-md border-white rounded-xl shadow-sm font-bold text-slate-700 hover:bg-white transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="7" className="font-medium rounded-lg">7 Hari Terakhir</SelectItem>
              <SelectItem value="14" className="font-medium rounded-lg">14 Hari Terakhir</SelectItem>
              <SelectItem value="30" className="font-medium rounded-lg">30 Hari Terakhir</SelectItem>
              <SelectItem value="90" className="font-medium rounded-lg">90 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <button 
            onClick={() => refetch()}
            disabled={isRefetching}
            className="w-11 h-11 bg-white/80 backdrop-blur-md border border-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-green-600 hover:bg-white transition-all disabled:opacity-50"
          >
            <AppIcon icon="RefreshCw" className={`w-5 h-5 ${isRefetching ? 'animate-spin text-green-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
            <AppIcon icon="Eye" className="w-24 h-24 text-green-900" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
              <AppIcon icon="Eye" className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Views</span>
          </div>
          <p className="text-3xl font-black text-slate-800 relative z-10">{analytics.totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
            <AppIcon icon="Globe" className="w-24 h-24 text-teal-900" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
              <AppIcon icon="Globe" className="w-5 h-5 text-teal-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sesi Unik</span>
          </div>
          <p className="text-3xl font-black text-slate-800 relative z-10">{analytics.uniqueSessions.toLocaleString()}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
            <AppIcon icon="Users" className="w-24 h-24 text-amber-900" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
              <AppIcon icon="Users" className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Login</span>
          </div>
          <p className="text-3xl font-black text-slate-800 relative z-10">{analytics.uniqueUsers.toLocaleString()}</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none transform translate-x-2 -translate-y-2">
            <AppIcon icon="TrendingUp" className="w-24 h-24 text-rose-900" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
              <AppIcon icon="TrendingUp" className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hari Ini</span>
          </div>
          <p className="text-3xl font-black text-slate-800 relative z-10">{analytics.todayViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-[1.5rem] border border-white/80 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 p-2 gap-2">
          {[
            { id: 'traffic', label: 'Traffic Harian' },
            { id: 'pages', label: 'Halaman Populer' },
            { id: 'devices', label: 'Perangkat & Browser' },
            { id: 'recent', label: 'Kunjungan Terbaru' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-green-50 text-green-600 shadow-sm border border-green-100/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'traffic' && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Traffic {days} Hari Terakhir</h3>
              {chartData.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      />
                      <Line type="monotone" dataKey="views" name="Views" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="sessions" name="Sesi" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-bold text-slate-500">Belum ada data traffic</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Top 10 Halaman Populer</h3>
              {analytics.topPages.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topPages} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="path" axisLine={false} tickLine={false} width={150} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} tickFormatter={(value) => value.length > 25 ? value.slice(0, 25) + '...' : value} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="views" name="Views" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-bold text-slate-500">Belum ada data halaman</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="animate-fade-in grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-6 text-center">Perangkat</h3>
                {analytics.deviceBreakdown.length > 0 ? (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.deviceBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="count" nameKey="device" stroke="none">
                            {analytics.deviceBreakdown.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                      {analytics.deviceBreakdown.map((item, index) => (
                        <div key={item.device} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-bold text-slate-700 capitalize">{item.device}</span>
                          <span className="text-xs font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12"><p className="font-bold text-slate-500">Belum ada data perangkat</p></div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-6 text-center">Browser</h3>
                {analytics.browserBreakdown.length > 0 ? (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.browserBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="count" nameKey="browser" stroke="none">
                            {analytics.browserBreakdown.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                      {analytics.browserBreakdown.map((item, index) => (
                        <div key={item.browser} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-bold text-slate-700">{item.browser}</span>
                          <span className="text-xs font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12"><p className="font-bold text-slate-500">Belum ada data browser</p></div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="animate-fade-in">
              <h3 className="font-bold text-lg text-slate-800 mb-6">Kunjungan Terbaru</h3>
              {analytics.recentViews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.recentViews.map((view, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 text-green-500 shadow-sm">
                        <DeviceIcon device={view.device_type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate mb-1" title={view.page_path}>{view.page_path}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <AppIcon icon="Clock" className="w-3 h-3" />
                          {formatDistanceToNow(new Date(view.created_at), { addSuffix: true, locale: id })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-bold text-slate-500">Belum ada kunjungan tercatat</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
