"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Newspaper, 
  Calendar, 
  Share2, 
  Clock, 
  Eye, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Bookmark, 
  ArrowLeft, 
  Check, 
  Copy, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNews, News } from '@/hooks/useNews';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BackButton from '@/components/ui/BackButton';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function NewsDetail() {
  const { id } = useParams() as { id: string };
  const { news, loading, incrementViews } = useNews();
  const { t, getText, language } = useLanguage();
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const article = news.find(n => n.id === Number(id));
  const articleId = article?.id;
  const articleViews = article?.views_count || 0;

  // Increment views count once when article opens
  useEffect(() => {
    if (articleId) {
      const sessionKey = `viewed_news_${articleId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        incrementViews(articleId, articleViews);
      }
    }
  }, [articleId, articleViews, incrementViews]);

  useEffect(() => {
    if (article) {
      const displayTitle = getText(article.title_id, article.title_en, article.title);
      document.title = `${displayTitle} - ${language === 'en' ? 'Ragunan Zoo' : 'Taman Margasatwa Ragunan'}`;
    }
  }, [article, language, getText]);

  // Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const locale = language === 'en' ? 'en-US' : 'id-ID';
      return new Date(dateStr).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success(language === 'en' ? 'Article link copied!' : 'Tautan berita berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const displayTitle = article ? getText(article.title_id, article.title_en, article.title) : '';
    const text = encodeURIComponent(`*${displayTitle}*\n\nBaca selengkapnya di warta resmi Ragunan:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    const url = window.location.href;
    const displayTitle = article ? getText(article.title_id, article.title_en, article.title) : '';
    const displayDesc = article ? getText(article.description_id, article.description_en, article.description || '') : '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: displayDesc,
          url: url
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedbackGiven(type);
    if (type === 'yes') {
      toast.success(language === 'en' ? 'Thank you for your feedback!' : 'Terima kasih atas umpan balik Anda!');
    } else {
      toast.info(language === 'en' ? 'Thank you, we will keep improving our news updates.' : 'Terima kasih, kami akan terus meningkatkan kualitas warta berita.');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in min-h-screen bg-background">
        <div className="bg-slate-950 text-white py-12 px-4">
          <div className="container mx-auto max-w-4xl space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
          <div className="h-[400px] w-full bg-muted rounded-3xl animate-pulse" />
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="animate-fade-in min-h-screen bg-background">
        <div className="bg-slate-950 text-white p-6">
          <div className="container mx-auto max-w-4xl">
            <BackButton fallbackPath="/news" variant="header" />
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <Newspaper className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Article Not Found' : 'Berita Tidak Ditemukan'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 font-medium mb-8 text-sm max-w-md mx-auto">
            {language === 'en'
              ? 'The article you are looking for may have been archived or removed.'
              : 'Berita yang Anda cari tidak tersedia atau mungkin sudah dihapus dari sistem.'}
          </p>
          <Link href="/news">
            <Button className="bg-primary text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-md">
              {language === 'en' ? 'Return to Newsroom' : 'Kembali ke Portal Berita'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = getText(article.title_id, article.title_en, article.title);
  const displayDescription = getText(article.description_id, article.description_en, article.description || '');

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-20">
      
      {/* ══════════ TOP READING PROGRESS BAR ══════════ */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-primary via-green-400 to-amber-400 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ══════════ ARTICLE HEADER ══════════ */}
      <header className="relative bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 text-white pt-8 pb-12 px-4 border-b border-green-900/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10">
          
          {/* Top Bar with Back Button & Share quick trigger */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-extrabold text-white transition-all backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'en' ? 'Back to Newsroom' : 'Portal Berita'}</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNativeShare}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                title="Bagikan"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            {article.category && (
              <Badge className="bg-primary text-slate-950 font-black text-xs px-3 py-1 border-none shadow-sm">
                {article.category}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/15 backdrop-blur-md text-white border-white/25 text-xs px-3 py-1 font-bold">
              Warta Resmi Margasatwa
            </Badge>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            {displayTitle}
          </h1>

          {/* Author & Publication Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15 text-xs text-slate-100 font-bold">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-slate-950 flex items-center justify-center font-black text-sm shadow-inner">
                TM
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-white text-sm">
                  <span>Redaksi Ragunan Zoo</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[11px] text-slate-200 font-medium">Taman Margasatwa Ragunan Official</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(article.created_at)}
              </span>
              {article.read_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {article.read_time}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                {article.views_count || 0} dibaca
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ══════════ ARTICLE BODY & MEDIA ══════════ */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <article className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          
          {/* Main Hero Image Banner */}
          {article.image_url ? (
            <div className="relative w-full bg-slate-950 overflow-hidden max-h-[520px]">
              <img
                src={article.image_url}
                alt={displayTitle}
                className="w-full h-auto object-contain max-h-[520px] mx-auto block"
              />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-green-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-white">
              <Newspaper className="w-16 h-16 text-primary mb-2" />
              <span className="text-xs font-bold text-slate-200">Ragunan Zoo Information Center</span>
            </div>
          )}

          {/* Main Text Content */}
          <div className="p-6 sm:p-10 lg:p-12">
            
            {/* Quick Share Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-4 rounded-2xl bg-muted/50 border border-border">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary" />
                <span>{language === 'en' ? 'Share this article:' : 'Bagikan berita ini:'}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3.5 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
                  <span>{copiedLink ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Copy Link' : 'Salin Tautan')}</span>
                </button>
              </div>
            </div>

            {/* Article Content Paragraphs */}
            <div className="prose prose-base dark:prose-invert max-w-none space-y-6">
              
              {/* Lead Paragraph Styling */}
              <p className="text-foreground font-semibold text-base sm:text-lg leading-relaxed border-l-4 border-primary pl-4 py-1.5 bg-primary/10 rounded-r-xl">
                {displayDescription}
              </p>

              {/* Extended Mock Article Details if available */}
              <div className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base space-y-4 pt-4 font-medium">
                <p>
                  Pengelola Taman Margasatwa Ragunan senantiasa berkomitmen untuk menjaga kenyamanan, keamanan, serta kesejahteraan seluruh koleksi satwa dan pengunjung. Program ini merupakan bagian dari upaya berkelanjutan dalam memperkuat fungsi edukasi serta konservasi lingkungan hidup di ibu kota.
                </p>

                {/* Callout Quote Box */}
                <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 text-white shadow-lg border border-primary/30 relative overflow-hidden">
                  <Sparkles className="w-8 h-8 text-primary mb-2" />
                  <p className="font-bold text-sm sm:text-base italic text-slate-100 leading-relaxed mb-2">
                    "Kenyamanan satwa dan kualitas edukasi pengunjung adalah prioritas utama kami dalam mewujudkan Taman Margasatwa Ragunan yang ramah dan berstandar internasional."
                  </p>
                  <span className="text-xs font-black text-primary">
                    — Tim Pengelola Taman Margasatwa Ragunan
                  </span>
                </div>

                <p>
                  Masyarakat diimbau untuk senantiasa mematuhi peraturan yang berlaku di area taman, termasuk menjaga kebersihan lingkungan dan memperhatikan petunjuk keselamatan saat berinteraksi di sekitar kandang peragaan.
                </p>
              </div>

            </div>

            {/* Article Feedback Widget */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center">
                <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-1">
                  {language === 'en' ? 'Was this article helpful?' : 'Apakah berita ini bermanfaat bagi Anda?'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-4">
                  {language === 'en' ? 'Your feedback helps us improve our news publishing.' : 'Umpan balik Anda membantu kami menyajikan informasi publik yang lebih baik.'}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleFeedback('yes')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      feedbackGiven === 'yes'
                        ? 'bg-primary text-slate-950 font-black shadow-md'
                        : 'bg-card border border-border hover:border-primary text-foreground'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 text-slate-950" />
                    <span>Ya, Sangat Membantu</span>
                  </button>

                  <button
                    onClick={() => handleFeedback('no')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      feedbackGiven === 'no'
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'bg-card border border-border hover:border-slate-400 text-foreground'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4 text-slate-400" />
                    <span>Kurang Membantu</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </article>

        {/* ══════════ RELATED NEWS SECTION ══════════ */}
        <RelatedNews currentId={article.id} />
      </main>

    </div>
  );
}

// Upgraded Related News Component
function RelatedNews({ currentId }: { currentId: number }) {
  const { getPublishedNews } = useNews();
  const { getText, language } = useLanguage();
  const publishedNews = getPublishedNews();
  const relatedNews = publishedNews.filter(n => n.id !== currentId).slice(0, 3);

  if (relatedNews.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <span>{language === 'en' ? 'Related Articles' : 'Berita & Informasi Terkait'}</span>
        </h3>

        <Link
          href="/news"
          className="text-xs font-extrabold text-slate-900 dark:text-slate-100 hover:text-primary flex items-center gap-1"
        >
          <span>{language === 'en' ? 'View All' : 'Lihat Semua'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {relatedNews.map(item => {
          const displayTitle = getText(item.title_id, item.title_en, item.title);
          const displayDesc = getText(item.description_id, item.description_en, item.description || '');

          return (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="relative h-36 bg-muted overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <Newspaper className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  {item.category && (
                    <Badge className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-white text-[10px] border-none px-2 py-0.5 font-bold">
                      {item.category}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
                    {displayTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center justify-between text-[11px] text-slate-950 dark:text-slate-100 group-hover:text-primary font-black">
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {language === 'en' ? 'Read' : 'Baca'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                {item.views_count && (
                  <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    {item.views_count}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
