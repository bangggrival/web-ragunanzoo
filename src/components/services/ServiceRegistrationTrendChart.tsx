import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { AppIcon } from '@/components/ui/AppIcon';
import { ServiceRegistration } from '@/hooks/useServiceRegistrations';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface ServiceRegistrationTrendChartProps {
  registrations: ServiceRegistration[];
}

const COLORS = {
  pkl: '#22c55e',
  research: '#3b82f6',
  koas: '#f97316',
  interview: '#8b5cf6',
  pending: '#eab308',
  reviewing: '#3b82f6',
  approved: '#22c55e',
  rejected: '#ef4444',
  completed: '#8b5cf6',
};

export function ServiceRegistrationTrendChart({ registrations }: ServiceRegistrationTrendChartProps) {
  const chartData = useMemo(() => {
    const safeRegistrations = Array.isArray(registrations) ? registrations : [];
    // Get last 6 months
    const months: { month: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = startOfMonth(subMonths(new Date(), i));
      months.push({
        month,
        label: format(month, 'MMM yyyy', { locale: localeId }),
      });
    }

    return months.map(({ month, label }) => {
      const monthStart = month;
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

      const monthRegistrations = safeRegistrations.filter((reg) => {
        const createdAt = parseISO(reg.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      return {
        name: label,
        total: monthRegistrations.length,
        pkl: monthRegistrations.filter((r) => r.program_type === 'pkl').length,
        research: monthRegistrations.filter((r) => r.program_type === 'research').length,
        koas: monthRegistrations.filter((r) => r.program_type === 'koas').length,
        interview: monthRegistrations.filter((r) => r.program_type === 'interview').length,
      };
    });
  }, [registrations]);

  const statusData = useMemo(() => {
    const safeRegistrations = Array.isArray(registrations) ? registrations : [];
    const statusCounts = {
      pending: safeRegistrations.filter(r => r.status === 'pending').length,
      reviewing: safeRegistrations.filter(r => r.status === 'reviewing').length,
      approved: registrations.filter(r => r.status === 'approved').length,
      rejected: registrations.filter(r => r.status === 'rejected').length,
      completed: registrations.filter(r => r.status === 'completed').length,
    };

    return [
      { name: 'Menunggu', value: statusCounts.pending, color: COLORS.pending },
      { name: 'Ditinjau', value: statusCounts.reviewing, color: COLORS.reviewing },
      { name: 'Disetujui', value: statusCounts.approved, color: COLORS.approved },
      { name: 'Ditolak', value: statusCounts.rejected, color: COLORS.rejected },
      { name: 'Selesai', value: statusCounts.completed, color: COLORS.completed },
    ].filter(item => item.value > 0);
  }, [registrations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AppIcon name="solar:chart-2-bold-duotone" className="w-5 h-5 text-emerald-600" />
            Tren Pendaftaran 6 Bulan Terakhir
          </CardTitle>
          <CardDescription>Jumlah pendaftaran per program per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar 
                  dataKey="pkl" 
                  name="PKL" 
                  fill={COLORS.pkl} 
                  radius={[0, 0, 0, 0]} 
                  stackId="stack"
                />
                <Bar 
                  dataKey="research" 
                  name="Penelitian" 
                  fill={COLORS.research} 
                  radius={[0, 0, 0, 0]} 
                  stackId="stack"
                />
                <Bar 
                  dataKey="koas" 
                  name="Koas" 
                  fill={COLORS.koas} 
                  radius={[0, 0, 0, 0]} 
                  stackId="stack"
                />
                <Bar 
                  dataKey="interview" 
                  name="Wawancara" 
                  fill={COLORS.interview} 
                  radius={[4, 4, 0, 0]} 
                  stackId="stack"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AppIcon name="solar:pie-chart-2-bold-duotone" className="w-5 h-5 text-blue-600" />
            Distribusi Status Pendaftaran
          </CardTitle>
          <CardDescription>Persentase status pendaftaran saat ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Belum ada data pendaftaran
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={((value: number) => [`${value} pendaftaran`, '']) as any}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
