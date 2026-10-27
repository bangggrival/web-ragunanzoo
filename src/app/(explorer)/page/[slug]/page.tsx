"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomPage } from '@/hooks/useCustomPages';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrganizationMemberships } from '@/hooks/useOrganizationMemberships';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppIcon } from '@/components/ui/AppIcon';
import { useState } from 'react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import BackButton from '@/components/ui/BackButton';

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: page, isLoading, error } = useCustomPage(slug || '');
  const { activeOrganizations } = useOrganizationMemberships();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Show organizations on "about" related pages
  const isAboutPage = slug === 'tentang-kami' || slug === 'about-us' || slug === 'about' || slug === 'visi-misi';

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="p-4 bg-red-100 text-red-900 border border-red-300 rounded-md font-mono text-xs whitespace-pre-wrap">
          <h3>DEBUG INFO</h3>
          <p>slug: {JSON.stringify(slug)}</p>
          <p>isLoading: {JSON.stringify(isLoading)}</p>
          <p>error: {JSON.stringify(error)}</p>
          <p>page: {JSON.stringify(page)}</p>
        </div>
        <Skeleton className="h-8 w-48 mt-4 mb-4" />
        <Skeleton className="h-64 w-full mb-4 rounded-lg" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AppIcon icon="AlertCircle" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold mb-2">
              {language === 'id' ? 'Halaman Tidak Ditemukan' : 'Page Not Found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'id' 
                ? 'Maaf, halaman yang Anda cari tidak tersedia atau belum dipublikasikan.'
                : 'Sorry, the page you are looking for is not available or has not been published.'}
            </p>
            <Button asChild variant="outline">
              <Link href="/">
                <AppIcon icon="ArrowLeft" className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = language === 'id' ? page.title_id : (page.title_en || page.title_id);
  const content = language === 'id' ? page.content_id : (page.content_en || page.content_id);
  const hasImages = page.image_urls && page.image_urls.length > 0;
  const images = page.image_urls || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <BackButton fallbackPath="/" className="mb-4" />

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <AppIcon icon="FileText" className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
        </div>
      </div>

      {/* Image Gallery */}
      {hasImages && (
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden bg-muted group">
            {/* Main Image */}
            <div 
              className="aspect-[16/9] md:aspect-[21/9] cursor-zoom-in"
              onClick={() => openLightbox(currentImageIndex)}
            >
              <img
                src={images[currentImageIndex]}
                alt={`${title} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              
              {/* Zoom Indicator */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <AppIcon icon="Expand" className="w-4 h-4" />
                  <span className="text-sm">Klik untuk memperbesar</span>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <AppIcon icon="ChevronLeft" className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <AppIcon icon="ChevronRight" className="w-5 h-5" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <Card>
        <CardContent className="p-6 md:p-8">
          {content ? (
            <div 
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:text-foreground prose-p:text-muted-foreground
                prose-strong:text-foreground prose-a:text-primary
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {content.split('\n').map((paragraph, index) => {
                // Handle headers
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{paragraph.slice(4)}</h3>;
                }
                // Handle list items
                if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
                  return (
                    <div key={index} className="flex gap-2 my-1">
                      <span className="text-primary">•</span>
                      <span>{paragraph.slice(2)}</span>
                    </div>
                  );
                }
                // Handle numbered items
                if (/^\d+\.\s/.test(paragraph)) {
                  const match = paragraph.match(/^(\d+)\.\s(.*)$/);
                  if (match) {
                    return (
                      <div key={index} className="flex gap-2 my-1">
                        <span className="text-primary font-medium">{match[1]}.</span>
                        <span>{match[2]}</span>
                      </div>
                    );
                  }
                }
                // Regular paragraph
                if (paragraph.trim()) {
                  return <p key={index} className="my-3 leading-relaxed">{paragraph}</p>;
                }
                return <div key={index} className="h-2" />;
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {language === 'id' ? 'Konten belum tersedia.' : 'Content not available yet.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Member of Organizations Section - shown on About pages */}
      {isAboutPage && activeOrganizations.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6 md:p-8">
            <div className="text-center">
              {/* Section Title */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="hidden sm:block w-16 h-px bg-gradient-to-r from-transparent to-primary/30" />
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold">
                    {language === 'en' ? 'Member of' : 'Anggota Dari'}
                  </p>
                </div>
                <div className="hidden sm:block w-16 h-px bg-gradient-to-l from-transparent to-primary/30" />
              </div>

              {/* Organization logos */}
              <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
                {activeOrganizations.map((org) => (
                  <Tooltip key={org.id}>
                    <TooltipTrigger asChild>
                      <a
                        href={org.website_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300"
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm group-hover:shadow-md flex items-center justify-center p-3 transition-all duration-300 group-hover:scale-105">
                          {org.logo_url ? (
                            <img
                              src={org.logo_url}
                              alt={org.name}
                              className="max-w-full max-h-full object-contain transition-transform duration-300 drop-shadow-sm"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xl font-bold text-primary">{org.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          {org.name}
                        </span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm font-medium">{org.full_name || org.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={title}
      />
    </div>
  );
}
