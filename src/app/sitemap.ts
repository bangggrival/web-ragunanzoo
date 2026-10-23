import { MetadataRoute } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragunanzoo.jakarta.go.id';
  const currentDate = new Date().toISOString();

  // Static Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/fauna`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/flora`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/map`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/tickets`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/venues`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tour-guide`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/audio-guide`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/gallery-3d`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/history`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/qr-scan`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/layanan-magang`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/standar-pelayanan`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/library`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/report-facility`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/jdih`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/wbs`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
  ];

  try {
    // Fetch dynamic content from database
    const [animalsRes, plantsRes, eventsRes, newsRes, venuesRes] = await Promise.allSettled([
      supabase.from('animals').select('id, updated_at'),
      supabase.from('plants').select('id, updated_at'),
      supabase.from('events').select('id, updated_at'),
      supabase.from('news').select('id, updated_at'),
      supabase.from('venues').select('id, updated_at'),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [];

    if (animalsRes.status === 'fulfilled' && Array.isArray(animalsRes.value?.data)) {
      animalsRes.value.data.forEach((item: any) => {
        dynamicRoutes.push({
          url: `${baseUrl}/fauna/${item.id}`,
          lastModified: item.updated_at || currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    if (plantsRes.status === 'fulfilled' && Array.isArray(plantsRes.value?.data)) {
      plantsRes.value.data.forEach((item: any) => {
        dynamicRoutes.push({
          url: `${baseUrl}/flora/${item.id}`,
          lastModified: item.updated_at || currentDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value?.data)) {
      eventsRes.value.data.forEach((item: any) => {
        dynamicRoutes.push({
          url: `${baseUrl}/events/${item.id}`,
          lastModified: item.updated_at || currentDate,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }

    if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value?.data)) {
      newsRes.value.data.forEach((item: any) => {
        dynamicRoutes.push({
          url: `${baseUrl}/news/${item.id}`,
          lastModified: item.updated_at || currentDate,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }

    if (venuesRes.status === 'fulfilled' && Array.isArray(venuesRes.value?.data)) {
      venuesRes.value.data.forEach((item: any) => {
        dynamicRoutes.push({
          url: `${baseUrl}/venues/${item.id}`,
          lastModified: item.updated_at || currentDate,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticRoutes;
  }
}
