"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useNews, News } from '@/hooks/useNews';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ModernMediaCard from '@/components/ui/ModernMediaCard';

export default function ExplorerNews() {
  const { news, loading, getPublishedNews } = useNews();
  const { language, getText, t } = useLanguage();
  const publishedNews = getPublishedNews();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [emailSubcribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Categories list with counts
  const categories = useMemo(() => {
    const catsMap = new Map<string, number>();
    publishedNews.forEach(n => {
      if (n.category) {
        catsMap.set(n.category, (catsMap.get(n.category) || 0) + 1);
      }
    });
    return Array.from(catsMap.entries()).map(([name, count]) => ({ name, count }));
  }, [publishedNews]);

  // Filtered news based on search & category
  const filteredNews = useMemo(() => {
    return publishedNews.filter(item => {
      const title = getText(item.title_id, item.title_en, item.title).toLowerCase();
      const desc = getText(item.description_id, item.description_en, item.description || '').toLowerCase();
      const matchesSearch = title.includes(debouncedSearchQuery.toLowerCase()) || desc.includes(debouncedSearchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [publishedNews, debouncedSearchQuery, selectedCategory, getText]);

  // Featured Hero Article (First item)
  const featuredArticle = filteredNews[0] || publishedNews[0];
  const remainingArticles = featuredArticle 
    ? filteredNews.filter(n => n.id !== featuredArticle.id) 
    : filteredNews;

  // Breaking News ticker item
  const breakingNews = publishedNews[0];

  // Stats calculation
  const totalViews = useMemo(() => {
    return publishedNews.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
  }, [publishedNews]);

  const handleShare = (e: React.MouseEvent, item: News) => {
    e.preventDefault();
    e.stopPropagation();
    const title = getText(item.title_id, item.title_en, item.title);
    const url = `${window.location.origin}/news/${item.id}`;

    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success(language === 'en' ? 'Link copied to clipboard!' : 'Link berita berhasil disalin!');
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      toast.error(language === 'en' ? 'Please enter a valid email address' : 'Masukkan alamat email yang valid');
      return;
    }
    setEmailSubscribed(true);
    toast.success(language === 'en' ? 'Successfully subscribed to Ragunan Newsroom!' : 'Berhasil berlangganan Warta Ragunan!');
    setEmailInput('');
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-20">
      
      {/* ══════════ BREAKING NEWS TICKER BAR ══════════ */}
      {breakingNews && (
        <div className="bg-slate-950 text-white text-xs border-b border-green-800/40 py-2.5 px-4 font-semibold">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary text-slate-950 font-black text-[10px] uppercase tracking-wider flex-shrink-0 animate-pulse">
                <AppIcon icon="Megaphone" className="w-3 h-3" />
                <span>Kabar Terkini</span>
              </span>
              <Link 
                href={`/news/${breakingNews.id}`}
                className="font-bold text-white hover:text-primary truncate transition-colors"
              >
                {getText(breakingNews.title_id, breakingNews.title_en, breakingNews.title)}
              </Link>
            </div>
            <Link 
              href={`/news/${breakingNews.id}`}
              className="text-primary hover:text-white font-extrabold hidden sm:inline-flex items-center gap-1 text-[11px] flex-shrink-0"
            >
              <span>{language === 'en' ? 'Read' : 'Baca'}</span>
              <AppIcon icon="ChevronRight" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ══════════ HERO DIGITAL NEWSROOM HEADER ══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 text-white border-b border-green-900/30">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-600/15 rounded-full blur-3xl animate-float pointer-events-none" />

        <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-primary text-xs font-black backdrop-blur-md mb-4 shadow-inner">
              <AppIcon icon="Sparkles" className="w-4 h-4 text-primary" />
              <span>{language === 'en' ? 'Ragunan Digital Newsroom' : 'Portal Berita & Informasi Resmi'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
              {language === 'en' ? 'Latest Stories & Field Updates' : 'Kabar Ragunan Hari Ini'}
            </h1>

            <p className="text-slate-100 font-medium text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Official updates on animal conservation, upcoming weekend schedules, educational discoveries, and park management announcements.'
                : 'Temukan informasi terbaru seputar kesehatan satwa, agenda edukasi, event akhir pekan, serta pengumuman resmi dari Taman Margasatwa Ragunan.'}
            </p>

            {/* Search Input Box */}
            <div className="relative max-w-xl mx-auto mb-8">
              <AppIcon icon="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search articles, topics or keywords...' : 'Ketik judul berita, kata kunci satwa, atau pengumuman...'}
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-sm transition-all shadow-xl"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  <AppIcon icon="X" className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Stats Counters Strip */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-white shadow-lg">
              <div className="flex items-center gap-2">
                <AppIcon icon="BookOpen" className="w-4 h-4 text-primary" />
                <span>{publishedNews.length} {language === 'en' ? 'Articles' : 'Artikel Dipublikasikan'}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary hidden sm:block" />
              <div className="flex items-center gap-2">
                <AppIcon icon="TrendingUp" className="w-4 h-4 text-primary" />
                <span>{categories.length} {language === 'en' ? 'Categories' : 'Kategori Utama'}</span>
              </div>
              {totalViews > 0 && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <AppIcon icon="Eye" className="w-4 h-4 text-amber-400" />
                    <span>{totalViews.toLocaleString()} {language === 'en' ? 'Reads' : 'Total Pembaca'}</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* ══════════ CATEGORY PILLS FILTER BAR ══════════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-border/80">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mr-2 flex-shrink-0">
            <AppIcon icon="Filter" className="w-3.5 h-3.5 text-primary" />
            {language === 'en' ? 'Filter Category:' : 'Filter Kategori:'}
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-primary text-slate-950 font-black shadow-md scale-105'
                : 'bg-card text-slate-800 dark:text-slate-200 hover:bg-muted border border-border/80'
            }`}
          >
            <span>{language === 'en' ? 'All Stories' : 'Semua Berita'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-bold">
              {publishedNews.length}
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-primary text-slate-950 font-black shadow-md scale-105'
                  : 'bg-card text-slate-800 dark:text-slate-200 hover:bg-muted border border-border/80'
              }`}
            >
              <span>{cat.name}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-bold">
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          /* Skeleton Loader */
          <div className="space-y-8">
            <div className="h-96 w-full bg-muted rounded-3xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <AppIcon icon="Newspaper" className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {language === 'en' ? 'No Articles Found' : 'Belum Ada Berita yang Cocok'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto mb-6 font-medium">
              {language === 'en'
                ? 'Try adjusting your search query or selecting another category filter.'
                : 'Coba ubah kata pencarian Anda atau pilih kategori berita lainnya.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-5 py-2.5 bg-primary text-slate-950 rounded-xl text-xs font-black shadow-md hover:opacity-90 transition-all"
            >
              {language === 'en' ? 'Reset Filters' : 'Reset Pencarian'}
            </button>
          </div>
        ) : (
          <>
            {/* ══════════ FEATURED SPOTLIGHT MAGAZINE HEADLINE ══════════ */}
            {featuredArticle && !searchQuery && selectedCategory === 'all' && (
              <AnimatedSection animation="fade-in-up" className="mb-12">
                <div className="relative group overflow-hidden rounded-3xl border border-border bg-card shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-primary/40">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Image Box */}
                    <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-950">
                      <img
                        src={featuredArticle.image_url || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80'}
                        alt={getText(featuredArticle.title_id, featuredArticle.title_en, featuredArticle.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />

                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-slate-950 font-black text-xs shadow-md px-3 py-1 border-none">
                            <AppIcon icon="Flame" className="w-3.5 h-3.5 mr-1" />
                            Pilihan Redaksi
                          </Badge>
                          {featuredArticle.category && (
                            <Badge variant="secondary" className="bg-slate-950/80 backdrop-blur-md text-white border-white/20 text-xs px-3 py-1 font-extrabold">
                              {featuredArticle.category}
                            </Badge>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleShare(e, featuredArticle)}
                          className="w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                          title="Bagikan artikel ini"
                        >
                          <AppIcon icon="Share2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-card">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-slate-300 mb-4 font-bold">
                          <span className="flex items-center gap-1.5 text-primary font-black">
                            <AppIcon icon="Calendar" className="w-4 h-4" />
                            {formatDate(featuredArticle.created_at)}
                          </span>
                          {featuredArticle.read_time && (
                            <span className="flex items-center gap-1.5">
                              <AppIcon icon="Clock" className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                              {featuredArticle.read_time}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                          <Link href={`/news/${featuredArticle.id}`}>
                            {getText(featuredArticle.title_id, featuredArticle.title_en, featuredArticle.title)}
                          </Link>
                        </h2>

                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6 line-clamp-4">
                          {getText(featuredArticle.description_id, featuredArticle.description_en, featuredArticle.description || '')}
                        </p>
                      </div>

                      <div className="pt-5 border-t border-border flex items-center justify-between">
                        <Link
                          href={`/news/${featuredArticle.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md hover:opacity-90 transition-all hover:gap-3"
                        >
                          <span>{language === 'en' ? 'Read Full Story' : 'Baca Selengkapnya'}</span>
                          <AppIcon icon="ArrowRight" className="w-4 h-4" />
                        </Link>

                        {featuredArticle.views_count && (
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <AppIcon icon="Eye" className="w-3.5 h-3.5 text-primary" />
                            {featuredArticle.views_count} views
                          </span>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* ══════════ ARTICLES GRID & TRENDING SIDEBAR ══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Articles Grid (8 cols) */}
              <div className={searchQuery || selectedCategory !== 'all' ? 'lg:col-span-12' : 'lg:col-span-8'}>
                <h3 className="text-lg font-black text-foreground mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AppIcon icon="BookOpen" className="w-5 h-5 text-primary" />
                    <span>{searchQuery ? 'Hasil Pencarian' : (language === 'en' ? 'Latest Stories' : 'Kumpulan Berita Terbaru')}</span>
                    <span className="text-xs font-black text-slate-950 bg-primary px-2.5 py-0.5 rounded-full ml-1">
                      {filteredNews.length}
                    </span>
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(searchQuery || selectedCategory !== 'all' ? filteredNews : remainingArticles).map((item, idx) => {
                    const displayTitle = getText(item.title_id, item.title_en, item.title);
                    const displayDesc = getText(item.description_id, item.description_en, item.description || '');

                    return (
                      <AnimatedSection key={item.id} animation="fade-in-up" delay={idx * 40}>
                        <ModernMediaCard
                          href={`/news/${item.id}`}
                          imageSrc={item.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80'}
                          imageAlt={displayTitle}
                          title={displayTitle}
                          description={displayDesc}
                          aspectRatio="video"
                          badgeTopLeft={
                            item.category ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm pointer-events-none">
                                {item.category}
                              </div>
                            ) : null
                          }
                          badgeTopRight={
                            <button
                              onClick={(e) => handleShare(e, item)}
                              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black flex items-center justify-center transition-all duration-200 border border-white/20 shadow-sm"
                              title="Bagikan"
                            >
                              <AppIcon icon="Share2" className="w-3.5 h-3.5" />
                            </button>
                          }
                          metaLabel={formatDate(item.created_at)}
                          metaIcon={<AppIcon icon="Calendar" className="w-3 h-3 text-primary" />}
                          metaRight={
                            item.read_time ? (
                              <span className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
                                <AppIcon icon="Clock" className="w-3 h-3 text-white/70" />
                                {item.read_time}
                              </span>
                            ) : undefined
                          }
                          actionText={language === 'en' ? 'Read Story' : 'Baca Artikel'}
                          className="h-full"
                        />
                      </AnimatedSection>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Trending Section (4 cols) */}
              {!searchQuery && selectedCategory === 'all' && (
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Top Read Stories */}
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-md">
                    <h3 className="text-base font-black text-foreground mb-5 flex items-center gap-2 border-b border-border pb-3">
                      <AppIcon icon="Flame" className="w-5 h-5 text-amber-500" />
                      <span>{language === 'en' ? 'Most Popular Stories' : 'Paling Banyak Dibaca'}</span>
                    </h3>

                    <div className="space-y-4">
                      {publishedNews.slice(0, 4).map((topItem, index) => (
                        <Link
                          key={topItem.id}
                          href={`/news/${topItem.id}`}
                          className="group flex gap-3.5 items-start pb-4 border-b border-border/60 last:border-0 last:pb-0 hover:bg-muted/50 p-2 rounded-xl transition-all"
                        >
                          <span className="font-black text-2xl text-primary group-hover:text-foreground transition-colors w-7 flex-shrink-0">
                            0{index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-bold mb-0.5">
                              <span>{formatDate(topItem.created_at)}</span>
                              {topItem.views_count && (
                                <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                                  <AppIcon icon="Eye" className="w-3 h-3 text-primary" />
                                  {topItem.views_count}
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {getText(topItem.title_id, topItem.title_en, topItem.title)}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter Subscription Box */}
                  <div className="rounded-3xl bg-card border border-primary/40 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="w-10 h-10 rounded-2xl bg-primary/15 text-slate-950 dark:text-primary flex items-center justify-center mb-3">
                      <AppIcon icon="Mail" className="w-5 h-5" />
                    </div>

                    <h4 className="font-black text-base text-foreground mb-1.5">
                      {language === 'en' ? 'Stay Updated with Ragunan' : 'Warta Ragunan Langsung'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
                      {language === 'en'
                        ? 'Subscribe to receive weekend schedule updates, new animal birth announcements, and visitor guides.'
                        : 'Dapatkan rangkuman info kegiatan akhir pekan dan kabar satwa terbaru langsung di inbox Anda.'}
                    </p>

                    {emailSubcribed ? (
                      <div className="p-3 rounded-xl bg-primary/15 border border-primary/30 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center gap-2">
                        <AppIcon icon="CheckCircle2" className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>Terima kasih telah berlangganan!</span>
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Masukkan email Anda..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs shadow-md hover:opacity-90 transition-opacity"
                        >
                          Berlangganan Warta
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Public Information Banner Box */}
                  <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-green-950 p-6 text-white shadow-xl relative overflow-hidden border border-green-500/30">
                    <AppIcon icon="Sparkles" className="w-7 h-7 text-primary mb-3" />
                    <h4 className="font-black text-base mb-2">
                      {language === 'en' ? 'Planning a Visit?' : 'Ingin Berkunjung ke Ragunan?'}
                    </h4>
                    <p className="text-xs text-slate-100 font-medium leading-relaxed mb-4">
                      {language === 'en'
                        ? 'Check public service standards, opening schedules, and location rental information.'
                        : 'Lihat panduan lengkap standar pelayanan publik, jam operasional, serta syarat persewaan area kegiatan.'}
                    </p>
                    <Link
                      href="/standar-pelayanan"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold transition-all text-white border border-white/20"
                    >
                      <span>Lihat Standar Pelayanan</span>
                      <AppIcon icon="ChevronRight" className="w-3.5 h-3.5 text-primary" />
                    </Link>
                  </div>

                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}
