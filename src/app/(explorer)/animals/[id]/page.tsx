"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Animal } from '@/hooks/useAnimals';
import { useCategories } from '@/hooks/useCategories';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import AnimalAudioPlayer from '@/components/audio/AnimalAudioPlayer';
import DynamicAnimalQuiz from '@/components/quiz/DynamicAnimalQuiz';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import AtmosphericHeader from '@/components/ui/AtmosphericHeader';
import CategoryIcon from '@/components/ui/CategoryIcon';
import ModernMediaCard from '@/components/ui/ModernMediaCard';
import LazyImage from '@/components/ui/LazyImage';
import IucnConservationMeter from '@/components/fauna/IucnConservationMeter';
import AnimalFunFactsCard from '@/components/fauna/AnimalFunFactsCard';

const ARViewer = dynamic(() => import('@/components/ar/ARViewer'), { ssr: false });

export default function AnimalDetail() {
  const { id } = useParams() as { id: string };
  const { language, getText } = useLanguage();
  const { categories } = useCategories();
  const { arEnabled, audioEnabled } = useFeatureFlags();
  const [animal, setAnimal] = useState<(Animal & { model_url?: string | null; audio_url?: string | null }) | null>(null);
  const [relatedAnimals, setRelatedAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Get category info for quiz
  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId);
  };

  const categoryInfo = animal ? getCategoryInfo(animal.category_id) : null;
  const categoryLabel = categoryInfo 
    ? getText(categoryInfo.name_id, categoryInfo.name_en, categoryInfo.name_id)
    : (animal?.category || '');

  useEffect(() => {
    const fetchAnimal = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', parseInt(id))
        .single();
      
      if (data && !error) {
        const currentAnimal = data as Animal & { model_url?: string | null; audio_url?: string | null };
        setAnimal(currentAnimal);

        // Fetch related animals from same category or featured
        const relatedQuery = supabase
          .from('animals')
          .select('*')
          .neq('id', parseInt(id))
          .limit(4);

        if (currentAnimal.category_id) {
          relatedQuery.eq('category_id', currentAnimal.category_id);
        } else {
          relatedQuery.eq('is_published', true);
        }

        const { data: relatedData } = await relatedQuery;
        if (relatedData && relatedData.length > 0) {
          setRelatedAnimals(relatedData as Animal[]);
        } else {
          // Fallback to any 4 published animals
          const { data: fallbackRelated } = await supabase
            .from('animals')
            .select('*')
            .neq('id', parseInt(id))
            .eq('is_published', true)
            .limit(4);
          if (fallbackRelated) setRelatedAnimals(fallbackRelated as Animal[]);
        }
      }
      setLoading(false);
    };

    fetchAnimal();
  }, [id]);

  useEffect(() => {
    if (animal) {
      const animalTitle = language === 'en' && animal.name_en ? animal.name_en : animal.name;
      document.title = `${animalTitle} - ${language === 'en' ? 'Ragunan Zoo' : 'Taman Margasatwa Ragunan'}`;
    }
  }, [animal, language]);

  // Handle native Web Share API with clipboard fallback
  const handleShare = async () => {
    const shareTitle = `${animal ? ((language === 'en' && animal.name_en) ? animal.name_en : animal.name) : 'Satwa'} | Taman Margasatwa Ragunan`;
    const shareText = `Kenali ${shareTitle} dan informasi konservasi resminya di Taman Margasatwa Ragunan Jakarta!`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success(language === 'en' ? 'Link copied to clipboard!' : 'Tautan satwa disalin ke papan klip!');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(language === 'en' ? 'Link copied to clipboard!' : 'Tautan satwa disalin ke papan klip!');
    }
  };

  // Get animal type from name for model mapping
  const getAnimalType = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('gajah') || lowerName.includes('elephant')) return 'elephant';
    if (lowerName.includes('harimau') || lowerName.includes('tiger')) return 'tiger';
    if (lowerName.includes('orangutan')) return 'orangutan';
    return 'default';
  };

  if (loading) {
    return (
      <div className="animate-fade-in min-h-screen bg-background">
        <div className="h-44 bg-emerald-950/20 animate-pulse border-b border-border/50" />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[440px] aspect-[4/3] sm:aspect-square bg-muted rounded-3xl animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-muted rounded-xl animate-pulse w-2/3" />
              <div className="h-6 bg-muted rounded-xl animate-pulse w-1/3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted rounded-2xl animate-pulse" />
                <div className="h-20 bg-muted rounded-2xl animate-pulse" />
              </div>
              <div className="h-48 bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
          <AppIcon icon="PawPrint" className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {language === 'en' ? 'Animal Not Found' : 'Satwa Tidak Ditemukan'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {language === 'en' 
            ? 'The animal you are looking for might have been moved or does not exist.' 
            : 'Data satwa yang Anda cari mungkin telah diperbarui atau belum terdaftar.'}
        </p>
        <Link 
          href="/fauna" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:scale-105 transition-all"
        >
          <span>←</span>
          <span>{language === 'en' ? 'Back to Fauna Catalog' : 'Kembali ke Katalog Satwa'}</span>
        </Link>
      </div>
    );
  }

  const animalName = (language === 'en' && animal.name_en) ? animal.name_en : animal.name;
  const animalDescription = (language === 'en' && animal.description_en) ? animal.description_en : animal.description;
  const animalHabitat = (language === 'en' && animal.habitat_en) 
    ? animal.habitat_en 
    : (animal.habitat || (language === 'en' ? 'Tropical Forest of Indonesia' : 'Hutan Tropis Indonesia'));

  const showARButton = true;
  const showAudioButton = true;
  const showQuizButton = true;

  const conservationStatus = (animal as any).conservation_status || animal.status || (language === 'en' ? 'Protected Species' : 'Dilindungi Undang-Undang');

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-12">
      {/* AR Viewer Modal */}
      {showAR && animal && (
        <ARViewer
          animalName={animalName}
          animalType={getAnimalType(animal.name)}
          modelUrl={animal.model_url}
          onClose={() => setShowAR(false)}
        />
      )}

      {/* Audio Player Modal */}
      {showAudio && animal && (
        <AnimalAudioPlayer
          audioUrl={animal.audio_url}
          animalName={animalName}
          onClose={() => setShowAudio(false)}
        />
      )}

      {/* Quiz Modal */}
      {showQuiz && animal && (
        <DynamicAnimalQuiz
          categoryId={categoryInfo?.id || (animal as any).category}
          categoryLabel={categoryLabel || (animal as any).category}
          categoryIcon={categoryInfo?.icon || '🐾'}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* ══════════ ATMOSPHERIC HERO HEADER (Single Unified Heading) ══════════ */}
      <AtmosphericHeader
        theme="fauna"
        icon={<AppIcon icon="PawPrint" className="w-5 h-5 md:w-6 md:h-6 text-emerald-200" />}
        title={animalName}
        description={animal.latin_name ? `Nama Ilmiah: ${animal.latin_name}` : undefined}
        backPath="/fauna"
        backLabel={language === 'en' ? 'Fauna Catalog' : 'Koleksi Satwa'}
        breadcrumbs={[
          { label: language === 'en' ? 'Explore' : 'Jelajahi', href: '/' },
          { label: language === 'en' ? 'Fauna' : 'Koleksi Satwa', href: '/fauna' },
          { label: animalName },
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <button
              id="share-animal-btn"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/12 hover:bg-white/20 border border-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-md shadow-sm transition-all hover:scale-105 active:scale-95"
              title={language === 'en' ? 'Share this animal' : 'Bagikan profil satwa ini'}
            >
              <AppIcon icon="Share2" className="w-4 h-4 text-emerald-300" />
              <span>{language === 'en' ? 'Share' : 'Bagikan'}</span>
            </button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* ── Main Layout: Image Left, Info Right ── */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 mb-8">

          {/* ── Left Column: Cinematic Media Stage & Floating Action Dock ── */}
          <div className="w-full lg:w-[440px] flex-shrink-0 flex flex-col gap-4">
            {/* Image Container with Floating Frosted Badges */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 shadow-xl border border-border/60 aspect-[4/3] sm:aspect-square group">
              {animal.image_url ? (
                <LazyImage
                  src={animal.image_url}
                  alt={animalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  wrapperClassName="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-2">
                  <AppIcon icon="PawPrint" className="w-20 h-20 stroke-[1.2]" />
                  <span className="text-xs text-white/50">{animalName}</span>
                </div>
              )}

              {/* Gradient Vignette for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Floating Badge: Category (Top Left) */}
              {categoryLabel && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/25 shadow-md">
                    {categoryInfo && (
                      <CategoryIcon 
                        icon={categoryInfo.icon} 
                        categoryName={categoryInfo.name_id} 
                        type="fauna" 
                        className="w-5 h-5" 
                      />
                    )}
                    <span>{categoryLabel}</span>
                  </span>
                </div>
              )}

              {/* Floating Badge: Featured / Ikonik (Top Right) */}
              {animal.is_featured && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950 shadow-sm backdrop-blur-md">
                    <AppIcon icon="Sparkles" className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                    <span>Ikonik</span>
                  </span>
                </div>
              )}

              {/* Floating Badge: Conservation Status (Bottom Left) */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md border border-white/20">
                  <AppIcon icon="ShieldCheck" className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{conservationStatus}</span>
                </span>

                {animal.zone && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-md">
                    <AppIcon icon="MapPin" className="w-3 h-3 text-primary-foreground" />
                    <span>{animal.zone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ── Interactive Engagement Dock (Thumb-Friendly) ── */}
            <div className="p-2 rounded-2xl bg-card border border-border shadow-sm">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* Audio Button */}
                <button
                  id="audio-play-btn"
                  onClick={() => setShowAudio(true)}
                  disabled={!showAudioButton}
                  className={`flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all ${
                    showAudioButton
                      ? 'bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white hover:scale-[1.02] shadow-2xs'
                      : 'bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed'
                  }`}
                  title={showAudioButton ? 'Putar Suara Satwa' : 'Suara satwa belum tersedia'}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AppIcon icon="Volume2" className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] truncate">
                    {language === 'en' ? 'Listen Sound' : 'Suara Satwa'}
                  </span>
                </button>

                {/* AR 3D Button */}
                <button
                  id="ar-view-btn"
                  onClick={() => setShowAR(true)}
                  disabled={!showARButton}
                  className={`flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all ${
                    showARButton
                      ? 'bg-teal-500/15 hover:bg-teal-600 text-teal-700 dark:text-teal-300 hover:text-white hover:scale-[1.02] shadow-2xs'
                      : 'bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed'
                  }`}
                  title={showARButton ? 'Lihat 3D / AR' : 'Model AR belum tersedia'}
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <AppIcon icon="Camera" className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] truncate">
                    {language === 'en' ? 'AR Camera' : 'Lihat 3D/AR'}
                  </span>
                </button>

                {/* Quiz Button */}
                <button
                  id="quiz-btn"
                  onClick={() => setShowQuiz(true)}
                  className="flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 rounded-xl text-xs font-bold bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground hover:scale-[1.02] transition-all shadow-2xs"
                  title="Kuis Edukasi Satwa"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <AppIcon icon="GraduationCap" className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] truncate">
                    {language === 'en' ? 'Play Quiz' : 'Kuis Satwa'}
                  </span>
                </button>
              </div>
            </div>

            {/* ── Embedded Bio-Audio Visualizer Stage ── */}
            <AnimalAudioPlayer
              audioUrl={animal.audio_url}
              animalName={animalName}
              embedded={true}
              className="w-full"
            />
          </div>

          {/* ── Right Column: Botanical Metric Strip & About Story ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-5">

            {/* Botanical Metric Strip (4 Cards) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Metric 1: Location with interactive map shortcut */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="MapPin" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'Location' : 'Kandang / Zona'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate mb-1">
                    {animal.location || animal.zone || (language === 'en' ? 'Main Zoo Area' : 'Kawasan Utama')}
                  </p>
                  <Link
                    href={`/map?search=${encodeURIComponent(animal.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{language === 'en' ? 'View on Map & Route' : 'Buka di Peta & Navigasi'}</span>
                    <AppIcon icon="ArrowUpRight" className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Metric 2: Habitat */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="Leaf" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'Natural Habitat' : 'Habitat Alami'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {animalHabitat}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {language === 'en' ? 'Tropical Ecosystem' : 'Ekosistem Tropis'}
                  </p>
                </div>
              </div>

              {/* Metric 3: Category / Class */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="PawPrint" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'Animal Class' : 'Kelompok Satwa'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {categoryLabel || (language === 'en' ? 'Fauna' : 'Satwa Liar')}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {animal.species || (language === 'en' ? 'Vertebrate' : 'Vertebrata')}
                  </p>
                </div>
              </div>

              {/* Metric 4: Conservation Status */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-teal-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="ShieldCheck" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'IUCN Status' : 'Status Konservasi'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {conservationStatus}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    {language === 'en' ? 'Protected in Ragunan' : 'Konservasi Ragunan Zoo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-5 md:p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                    <AppIcon icon="PawPrint" className="w-4 h-4 text-primary" />
                    <span>{language === 'en' ? 'About This Species' : 'Tentang Satwa Ini'}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium">
                    {animal.latin_name ? animal.latin_name : animalName}
                  </span>
                </div>
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {animalDescription || (language === 'en' 
                    ? 'Information about this animal is currently being compiled by the Taman Margasatwa Ragunan biology conservation team.'
                    : 'Informasi deskripsi mendalam satwa ini sedang dikurasi oleh tim biologi dan konservasi Taman Margasatwa Ragunan.')}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon icon="ShieldCheck" className="w-4 h-4 text-emerald-500" />
                  <span>{language === 'en' ? 'Official Ragunan Conservation Record' : 'Catatan Resmi Konservasi Ragunan'}</span>
                </span>
                <Link href="/fauna" className="text-primary font-semibold hover:underline">
                  {language === 'en' ? 'Explore all fauna →' : 'Lihat semua satwa →'}
                </Link>
              </div>
            </div>

            {/* ── Interactive IUCN Conservation Scale ── */}
            <IucnConservationMeter
              statusText={conservationStatus}
              animalName={animalName}
            />
          </div>
        </div>

        {/* ── Section: Fakta Menarik & Wawasan Satwa Edukatif ── */}
        <AnimalFunFactsCard
          animalName={animalName}
          species={animal.species}
          habitat={animalHabitat}
          categoryName={categoryLabel}
          className="mb-8"
          onOpenQuiz={() => setShowQuiz(true)}
        />

        {/* ── Section: Rekomendasi Satwa Terkait ── */}
        {relatedAnimals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                  <AppIcon icon="PawPrint" className="w-5 h-5 text-primary" />
                  <span>{language === 'en' ? 'Discover More Wildlife' : 'Jelajahi Satwa Lainnya di Ragunan'}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === 'en' ? 'Similar species you might want to visit next' : 'Satwa menarik lainnya yang wajib Anda kunjungi'}
                </p>
              </div>

              <Link
                href="/fauna"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>{language === 'en' ? 'View Catalog' : 'Katalog Lengkap'}</span>
                <AppIcon icon="ChevronRight" className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {relatedAnimals.map((rel) => {
                const relName = (language === 'en' && rel.name_en) ? rel.name_en : rel.name;
                const relCategory = categories.find(c => c.id === rel.category_id);
                const relCategoryLabel = relCategory 
                  ? getText(relCategory.name_id, relCategory.name_en, relCategory.name_id) 
                  : (rel.species || 'Fauna');

                return (
                  <ModernMediaCard
                    key={rel.id}
                    href={`/animals/${rel.id}`}
                    imageSrc={rel.image_url || ''}
                    imageAlt={relName}
                    title={relName}
                    subtitle={relCategoryLabel}
                    badgeText={rel.status || undefined}
                    badgeVariant="emerald"
                    metaLabel={rel.location || rel.zone || undefined}
                    metaIcon={<AppIcon icon="MapPin" className="w-3 h-3 text-white/90" />}
                    aspectRatio="square"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
