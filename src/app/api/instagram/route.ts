import { NextResponse } from 'next/server';

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  likes_count?: number;
  comments_count?: number;
}

// Fallback curated posts for Ragunan Zoo Instagram feed when API token is not yet configured
const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    caption: 'Momen kebersamaan keluarga Harimau Sumatera di Taman Margasatwa Ragunan! 🐯🌿 #RagunanZoo #Conservation',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=800&q=80',
    permalink: 'https://www.instagram.com/ragunanzoo/',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes_count: 1420,
    comments_count: 89,
  },
  {
    id: 'ig-2',
    caption: 'Feeding time satwa primata di Pusat Primata Schmutzer hari ini penuh keceriaan! Yuk kunjungi Ragunan di akhir pekan ini. 🦧✨',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=800&q=80',
    permalink: 'https://www.instagram.com/ragunanzoo/',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes_count: 2105,
    comments_count: 134,
  },
  {
    id: 'ig-3',
    caption: 'Gajah Sumatera yang anggun sedang mandi dan bermain di area konservasi terbuka. Edukasi satwa terbaik untuk keluarga. 🐘🌿',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80',
    permalink: 'https://www.instagram.com/ragunanzoo/',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likes_count: 980,
    comments_count: 45,
  },
  {
    id: 'ig-4',
    caption: 'Keajaiban Komodo Dragon, satwa purba kebanggaan Indonesia di Taman Margasatwa Ragunan. Mari jaga kelestarian alam! 🦎🍃',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1564518006159-eeea79c58e58?auto=format&fit=crop&w=800&q=80',
    permalink: 'https://www.instagram.com/ragunanzoo/',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    likes_count: 1750,
    comments_count: 112,
  },
];

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  // If Official Meta Graph API token is provided, fetch live posts automatically from Instagram
  if (token) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=8&access_token=${token}`,
        { next: { revalidate: 3600 } } // Auto revalidate every 1 hour
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.data) {
          return NextResponse.json({
            success: true,
            isLive: true,
            posts: data.data as InstagramPost[],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching live Instagram posts:', error);
    }
  }

  // Fallback response with curated posts and isLive: false status
  return NextResponse.json({
    success: true,
    isLive: false,
    posts: FALLBACK_POSTS,
  });
}
