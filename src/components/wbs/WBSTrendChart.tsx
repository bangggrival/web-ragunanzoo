import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppIcon } from '@/components/ui/AppIcon';
import { WBSSubmission } from '@/hooks/useWBSSubmissions';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface WBSTrendChartProps {
  submissions: WBSSubmission[];
}

export function WBSTrendChart({ submissions }: WBSTrendChartProps) {
  const chartData = useMemo(() => {
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

      const monthSubmissions = submissions.filter((sub) => {
        const createdAt = parseISO(sub.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      return {
        name: label,
        total: monthSubmissions.length,
        pending: monthSubmissions.filter((s) => s.status === 'pending').length,
        investigating: monthSubmissions.filter((s) => s.status === 'investigating').length,
        resolved: monthSubmissions.filter((s) => s.status === 'resolved').length,
        dismissed: monthSubmissions.filter((s) => s.status === 'dismissed').length,
      };
    });
  }, [submissions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AppIcon name="solar:chart-2-bold-duotone" className="w-5 h-5" />
          Tren Laporan 6 Bulan Terakhir
        </CardTitle>
        <CardDescription>Jumlah laporan WBS per bulan berdasarkan status</CardDescription>
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
              <Bar dataKey="pending" name="Menunggu" fill="#eab308" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="investigating" name="Investigasi" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="resolved" name="Selesai" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="dismissed" name="Ditolak" fill="#6b7280" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
