import React, { useState } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useNews, News } from '@/hooks/useNews';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export type NewsSectionProps = React.HTMLAttributes<HTMLElement>;

const NewsSection = React.forwardRef<HTMLElement, NewsSectionProps>(
  (props, ref) => {
    const { loading, getPublishedNews } = useNews();
    const { t, getText, language } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const publishedNews = getPublishedNews();

    const formatDate = (dateStr: string) => {
      try {
        const locale = language === 'en' ? 'en-US' : 'id-ID';
        return new Date(dateStr).toLocaleDateString(locale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    // Filter categories dynamically
    const categories = ['all', 'Konservasi', 'Pengumuman', 'Edukasi', 'Kegiatan'];

    const filteredNews = publishedNews.filter(item => {
      if (selectedCategory === 'all') return true;
      return item.category?.toLowerCase() === selectedCategory.toLowerCase();
    });

    const spotlightArticle = filteredNews[0] || publishedNews[0];
    const secondaryArticles = spotlightArticle 
      ? filteredNews.filter(n => n.id !== spotlightArticle.id).slice(0, 2)
      : filteredNews.slice(1, 3);

    const handleShare = (e: React.MouseEvent, item: News) => {
      e.preventDefault();
      e.stopPropagation();
      const title = getText(item.title_id, item.title_en, item.title);
      const url = `${window.location.origin}/news/${item.id}`;
      
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        toast.success(language === 'en' ? 'Link copied to clipboard!' : 'Tautan berita berhasil disalin!');
      }
    };

    if (loading) {
      return (
        <section className="py-12" ref={ref} {...props}>
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded-full animate-pulse" />
              <div className="h-8 w-64 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-96 bg-muted rounded-3xl animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-44 bg-muted rounded-2xl animate-pulse" />
              <div className="h-44 bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </section>
      );
    }

    if (publishedNews.length === 0) return null;

    return (
      <section ref={ref} className="py-10 md:py-16 relative" {...props}>
        {/* Ambient Glow Background Accent */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/15 border border-green-600/30 text-green-900 dark:text-green-200 text-xs font-black mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
              </span>
              <span>{language === 'en' ? 'RAGUNAN NEWSROOM' : 'KABAR & BERITA TERKINI'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <span>{t('latest_news')}</span>
              <AppIcon name="solar:stars-bold" className="w-6 h-6 text-amber-500 hidden sm:inline-block" />
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium mt-1 max-w-xl">
              {language === 'en'
                ? 'Discover wildlife conservation stories, events, and official visitor guides.'
                : 'Temukan informasi menarik seputar konservasi satwa, agenda acara, dan pengumuman resmi.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/news" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-slate-950 hover:bg-primary transition-all duration-300 shadow-sm group"
            >
              <span>{t('see_all')}</span>
              <AppIcon name="solar:arrow-right-linear" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-2 flex-shrink-0">
            <AppIcon name="solar:filter-bold-duotone" className="w-3.5 h-3.5 text-primary" />
            {language === 'en' ? 'Filter:' : 'Kategori:'}
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-primary text-slate-950 shadow-md scale-105 font-black'
                  : 'bg-card text-slate-700 dark:text-slate-200 hover:text-foreground border border-border/80 hover:border-primary/50'
              }`}
            >
              {cat === 'all' ? (language === 'en' ? 'All Stories' : 'Semua Berita') : cat}
            </button>
          ))}
        </div>

        {/* Content Layout */}
        {spotlightArticle ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Spotlight Hero Article (7 cols) */}
            <div className="lg:col-span-7">
              <Link
                href={`/news/${spotlightArticle.id}`}
                className="group relative flex flex-col justify-end h-[360px] sm:h-[420px] lg:h-[460px] rounded-3xl overflow-hidden border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 block"
              >
                {/* Background Image / Placeholder */}
                {spotlightArticle.image_url ? (
                  <img
                    src={spotlightArticle.image_url}
                    alt={getText(spotlightArticle.title_id, spotlightArticle.title_en, spotlightArticle.title)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-800 to-slate-900 flex items-center justify-center">
                    <AppIcon name="solar:newspaper-bold-duotone" className="w-20 h-20 text-white/20" />
                  </div>
                )}

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Category Badge */}
                {spotlightArticle.category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-primary text-slate-950 shadow-md">
                      {spotlightArticle.category}
                    </span>
                  </div>
                )}

                {/* Content Banner at bottom */}
                <div className="relative z-10 p-6 sm:p-8 text-white">
                  <div className="flex items-center gap-4 text-xs text-green-200 font-bold mb-2">
                    <span className="flex items-center gap-1.5">
                      <AppIcon name="solar:calendar-bold-duotone" className="w-3.5 h-3.5 text-primary" />
                      {formatDate(spotlightArticle.created_at)}
                    </span>
                    {spotlightArticle.read_time && (
                      <span className="flex items-center gap-1.5">
                        <AppIcon name="solar:clock-circle-bold" className="w-3.5 h-3.5 text-primary" />
                        {spotlightArticle.read_time}
                      </span>
                    )}
                    {spotlightArticle.views_count && (
                      <span className="flex items-center gap-1.5 hidden sm:flex">
                        <AppIcon name="solar:eye-bold" className="w-3.5 h-3.5 text-amber-400" />
                        {spotlightArticle.views_count} views
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight drop-shadow-md mb-2">
                    {getText(spotlightArticle.title_id, spotlightArticle.title_en, spotlightArticle.title)}
                  </h3>

                  <p className="text-sm text-slate-200 line-clamp-2 font-medium leading-relaxed drop-shadow max-w-2xl">
                    {getText(spotlightArticle.description_id, spotlightArticle.description_en, spotlightArticle.description || '')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Secondary Articles Grid (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
              {secondaryArticles.map((item) => {
                const displayTitle = getText(item.title_id, item.title_en, item.title);
                const displayDescription = getText(item.description_id, item.description_en, item.description || '');

                return (
                  <Link 
                    key={item.id} 
                    href={`/news/${item.id}`}
                    className="group relative flex flex-col sm:flex-row h-full p-3.5 sm:p-4 gap-4 rounded-2xl md:rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 ease-spring overflow-hidden"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-muted/60">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={displayTitle}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-spring"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
                          <AppIcon name="solar:newspaper-bold-duotone" className="w-9 h-9 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                      {item.category && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/55 backdrop-blur-md text-white border border-white/20 shadow-sm">
                          {item.category}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div>
                        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] text-muted-foreground mb-1.5 font-medium">
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <AppIcon name="solar:calendar-bold-duotone" className="w-3 h-3 text-primary" />
                            {formatDate(item.created_at)}
                          </span>
                          {item.read_time && (
                            <span className="flex items-center gap-1">
                              <AppIcon name="solar:clock-circle-bold" className="w-3 h-3 text-muted-foreground" />
                              {item.read_time}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
                          {displayTitle}
                        </h4>

                        <p className="text-xs text-muted-foreground font-normal line-clamp-2 leading-relaxed">
                          {displayDescription}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="text-[11px] font-medium group-hover:text-primary transition-colors">
                          {language === 'en' ? 'Read Story' : 'Baca Selengkapnya'}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {item.views_count && (
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <AppIcon name="solar:eye-bold" className="w-3 h-3" />
                              {item.views_count}
                            </span>
                          )}
                          <div className="w-6 h-6 rounded-full bg-muted/80 group-hover:bg-primary text-muted-foreground group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-110">
                            <AppIcon name="solar:arrow-right-up-linear" className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    );
  }
);

NewsSection.displayName = 'NewsSection';
export default NewsSection;