'use client';

import React, { useEffect, useState } from 'react';
import { Instagram, ExternalLink, Heart, MessageCircle, Video, Layers } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { InstagramPost } from '@/app/api/instagram/route';

export default function InstagramFeed() {
  const { language } = useLanguage();
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const instagramUrl = settings?.social_instagram || 'https://www.instagram.com/ragunanzoo/';

  useEffect(() => {
    async function loadInstagramPosts() {
      try {
        setLoading(true);
        const res = await fetch('/api/instagram');
        if (res.ok) {
          const data = await res.json();
          if (data.posts) {
            setPosts(data.posts);
            setIsLive(data.isLive || false);
          }
        }
      } catch (err) {
        console.error('Failed to load Instagram feed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInstagramPosts();
  }, []);

  return (
    <section className="py-8 sm:py-12 px-3 sm:px-6 relative overflow-hidden bg-transparent">
      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {language === 'en' ? 'Instagram Feed' : 'Kabar Terbaru Instagram'}
                </h3>
                {isLive && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Live API
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === 'en'
                  ? 'Follow @ragunanzoo for daily wildlife updates & stories'
                  : 'Ikuti @ragunanzoo untuk cerita dan kabar satwa harian'}
              </p>
            </div>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white text-xs font-extrabold transition-all shadow-md hover:shadow-lg hover:scale-105 self-start sm:self-auto"
          >
            <Instagram className="w-4 h-4" />
            <span>{language === 'en' ? 'Follow on Instagram' : 'Ikuti di Instagram'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
            <Skeleton className="w-full aspect-square rounded-2xl sm:rounded-3xl" />
            <Skeleton className="w-full aspect-[4/5] rounded-2xl sm:rounded-3xl" />
            <Skeleton className="w-full aspect-square rounded-2xl sm:rounded-3xl" />
            <Skeleton className="w-full aspect-[4/5] rounded-2xl sm:rounded-3xl" />
          </div>
        ) : (
          /* Instagram Dynamic Grid (Responsive with variable aspect ratios for Reels/Videos) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
            {posts.map((post) => {
              const isVideo = post.media_type === 'VIDEO';
              const isCarousel = post.media_type === 'CAROUSEL_ALBUM';

              return (
                <a
                  key={post.id}
                  href={post.permalink || instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-border/70 hover:border-rose-500/40 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-spring hover:-translate-y-1 ${
                    isVideo ? 'aspect-[4/5]' : 'aspect-square'
                  }`}
                >
                  {/* Post Media Image / Thumbnail */}
                  <img
                    src={isVideo ? (post.thumbnail_url || post.media_url) : post.media_url}
                    alt={post.caption || 'Instagram Post'}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.05]"
                  />

                  {/* Top-Right Badge Indicator (Reels / Video / Carousel) */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-sm">
                      {isVideo ? (
                        <Video className="w-3.5 h-3.5 text-rose-400" />
                      ) : isCarousel ? (
                        <Layers className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <Instagram className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Gradient Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 text-white z-20">
                    <div className="space-y-1.5">
                      {post.caption && (
                        <p className="text-xs text-white/95 font-medium line-clamp-3 leading-snug drop-shadow-sm">
                          {post.caption}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] font-bold text-white/80 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            {post.likes_count || '1.2k'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                            {post.comments_count || '45'}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
