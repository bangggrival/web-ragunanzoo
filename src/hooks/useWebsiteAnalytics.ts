import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface AnalyticsData {
  totalViews: number;
  uniqueSessions: number;
  uniqueUsers: number;
  todayViews: number;
  viewsByDate: { date: string; views: number; sessions: number }[];
  topPages: { path: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  recentViews: { page_path: string; created_at: string; device_type: string }[];
}

interface PageView {
  id: string;
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  user_agent: string | null;
  session_id: string | null;
  user_id: string | null;
  ip_hash: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  created_at: string;
}

export function useWebsiteAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['website-analytics', days],
    queryFn: async (): Promise<AnalyticsData> => {
      const startDate = subDays(new Date(), days);
      const today = startOfDay(new Date());

      // Get all page views in the date range
      const { data: pageViews, error } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const views = pageViews || [];

      // Calculate metrics
      const totalViews = views.length;
      const uniqueSessions = new Set(views.map(v => v.session_id)).size;
      const uniqueUsers = new Set(views.filter(v => v.user_id).map(v => v.user_id)).size;
      
      // Today's views
      const todayViews = views.filter(v => 
        new Date(v.created_at) >= today
      ).length;

      // Views by date
      const viewsByDateMap = new Map<string, { views: number; sessions: Set<string> }>();
      views.forEach(v => {
        const date = format(new Date(v.created_at), 'yyyy-MM-dd');
        if (!viewsByDateMap.has(date)) {
          viewsByDateMap.set(date, { views: 0, sessions: new Set() });
        }
        const entry = viewsByDateMap.get(date)!;
        entry.views++;
        if (v.session_id) entry.sessions.add(v.session_id);
      });

      const viewsByDate = Array.from(viewsByDateMap.entries())
        .map(([date, data]) => ({
          date,
          views: data.views,
          sessions: data.sessions.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top pages
      const pageCountMap = new Map<string, number>();
      views.forEach(v => {
        pageCountMap.set(v.page_path, (pageCountMap.get(v.page_path) || 0) + 1);
      });
      const topPages = Array.from(pageCountMap.entries())
        .map(([path, viewCount]) => ({ path, views: viewCount }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Device breakdown
      const deviceCountMap = new Map<string, number>();
      views.forEach(v => {
        const device = v.device_type || 'unknown';
        deviceCountMap.set(device, (deviceCountMap.get(device) || 0) + 1);
      });
      const deviceBreakdown = Array.from(deviceCountMap.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Browser breakdown
      const browserCountMap = new Map<string, number>();
      views.forEach(v => {
        const browser = v.browser || 'unknown';
        browserCountMap.set(browser, (browserCountMap.get(browser) || 0) + 1);
      });
      const browserBreakdown = Array.from(browserCountMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Recent views (last 20)
      const recentViews = views.slice(0, 20).map(v => ({
        page_path: v.page_path,
        created_at: v.created_at,
        device_type: v.device_type || 'unknown'
      }));

      return {
        totalViews,
        uniqueSessions,
        uniqueUsers,
        todayViews,
        viewsByDate,
        topPages,
        deviceBreakdown,
        browserBreakdown,
        recentViews
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
}
