"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plant } from '@/hooks/usePlants';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import DynamicPlantQuiz from '@/components/quiz/DynamicPlantQuiz';
import { useLanguage } from '@/contexts/LanguageContext';
import AtmosphericHeader from '@/components/ui/AtmosphericHeader';
import CategoryIcon from '@/components/ui/CategoryIcon';
import ModernMediaCard from '@/components/ui/ModernMediaCard';
import LazyImage from '@/components/ui/LazyImage';

export default function PlantDetail() {
  const { id } = useParams() as { id: string };
  const { language, getText, t } = useLanguage();
  const { categories, getFloraCategories } = useCategories();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [relatedPlants, setRelatedPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  const floraCategories = getFloraCategories();
  const categoryInfo = plant ? categories.find(c => c.id === plant.category_id) : null;
  const categoryLabel = categoryInfo 
    ? getText(categoryInfo.name_id, categoryInfo.name_en, categoryInfo.name_id)
    : (plant?.category || (language === 'en' ? 'Flora' : 'Tumbuhan'));

  useEffect(() => {
    const fetchPlant = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (data && !error) {
        const currentPlant = data as Plant;
        setPlant(currentPlant);

        // Fetch related plants from same category
        const relatedQuery = supabase
          .from('plants')
          .select('*')
          .neq('id', parseInt(id))
          .limit(4);

        if (currentPlant.category_id) {
          relatedQuery.eq('category_id', currentPlant.category_id);
        } else {
          relatedQuery.eq('is_published', true);
        }

        const { data: relatedData } = await relatedQuery;
        if (relatedData && relatedData.length > 0) {
          setRelatedPlants(relatedData as Plant[]);
        } else {
          const { data: fallbackData } = await supabase
            .from('plants')
            .select('*')
            .neq('id', parseInt(id))
            .limit(4);
          if (fallbackData) setRelatedPlants(fallbackData as Plant[]);
        }
      }
      setLoading(false);
    };

    fetchPlant();
  }, [id]);

  const handleShare = async () => {
    const plantName = plant ? ((language === 'en' && plant.name_en) ? plant.name_en : plant.name) : 'Flora';
    const shareTitle = `${plantName} | Ragunan Zoo Flora`;
    const shareText = `Pelajari pohon dan tumbuhan ${plantName} (${plant?.latin_name || ''}) di Taman Margasatwa Ragunan!`;
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
          toast.success(language === 'en' ? 'Link copied to clipboard!' : 'Tautan tumbuhan disalin ke papan klip!');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(language === 'en' ? 'Link copied to clipboard!' : 'Tautan tumbuhan disalin ke papan klip!');
    }
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

  if (!plant) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
          <AppIcon icon="Leaf" className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {language === 'en' ? 'Plant Not Found' : 'Tumbuhan Tidak Ditemukan'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {language === 'en'
            ? 'The plant you are looking for might have been moved or does not exist.'
            : 'Data tumbuhan yang Anda cari mungkin telah diperbarui atau belum terdaftar.'}
        </p>
        <Link
          href="/flora"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:scale-105 transition-all"
        >
          <span>←</span>
          <span>{language === 'en' ? 'Back to Flora Catalog' : 'Kembali ke Katalog Flora'}</span>
        </Link>
      </div>
    );
  }

  const plantName = (language === 'en' && plant.name_en) ? plant.name_en : plant.name;
  const plantDescription = (language === 'en' && plant.description_en) ? plant.description_en : plant.description;
  const plantHabitat = (language === 'en' && plant.habitat_en)
    ? plant.habitat_en
    : (plant.habitat || (language === 'en' ? 'Tropical Rainforest' : 'Hutan Hujan Tropis'));

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-12">
      {/* Quiz Modal */}
      {showQuiz && (
        <DynamicPlantQuiz
          categoryId={categoryInfo?.id}
          categoryLabel={categoryLabel}
          categoryIcon="🌿"
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* ══════════ ATMOSPHERIC HERO HEADER ══════════ */}
      <AtmosphericHeader
        theme="flora"
        icon={<AppIcon icon="Leaf" className="w-5 h-5 md:w-6 md:h-6 text-lime-300" />}
        title={plantName}
        description={plant.latin_name ? `Nama Ilmiah / Botani: ${plant.latin_name}` : undefined}
        backPath="/flora"
        backLabel={language === 'en' ? 'Flora Catalog' : 'Koleksi Flora'}
        breadcrumbs={[
          { label: language === 'en' ? 'Explore' : 'Jelajahi', href: '/' },
          { label: language === 'en' ? 'Flora' : 'Koleksi Flora', href: '/flora' },
          { label: plantName },
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <button
              id="share-plant-btn"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/12 hover:bg-white/20 border border-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-md shadow-sm transition-all hover:scale-105 active:scale-95"
              title={language === 'en' ? 'Share this plant' : 'Bagikan informasi tumbuhan ini'}
            >
              <AppIcon icon="Share2" className="w-4 h-4 text-lime-300" />
              <span>{language === 'en' ? 'Share' : 'Bagikan'}</span>
            </button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* ── Main Layout: Image Left, Info Right ── */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 mb-8">

          {/* ── Left Column: Media Stage & Engagement Dock ── */}
          <div className="w-full lg:w-[440px] flex-shrink-0 flex flex-col gap-4">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 shadow-xl border border-border/60 aspect-[4/3] sm:aspect-square group">
              {plant.image_url ? (
                <LazyImage
                  src={plant.image_url}
                  alt={plantName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  wrapperClassName="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-2">
                  <AppIcon icon="Leaf" className="w-20 h-20 stroke-[1.2]" />
                  <span className="text-xs text-white/50">{plantName}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Floating Badge: Category (Top Left) */}
              {categoryLabel && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/25 shadow-md">
                    {categoryInfo && (
                      <CategoryIcon 
                        icon={categoryInfo.icon} 
                        categoryName={categoryInfo.name_id} 
                        type="flora" 
                        className="w-5 h-5" 
                      />
                    )}
                    <span>{categoryLabel}</span>
                  </span>
                </div>
              )}

              {/* Floating Badge: Featured (Top Right) */}
              {plant.is_featured && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950 shadow-sm backdrop-blur-md">
                    <AppIcon icon="Sparkles" className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                    <span>Pilihan</span>
                  </span>
                </div>
              )}

              {/* Floating Badge: Location & Species (Bottom) */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md border border-white/20">
                  <AppIcon icon="TreePine" className="w-3.5 h-3.5 text-lime-400" />
                  <span>{plant.species || 'Pohon & Tumbuhan Tropis'}</span>
                </span>

                {plant.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-md">
                    <AppIcon icon="MapPin" className="w-3 h-3 text-white" />
                    <span>{plant.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Engagement Dock */}
            <div className="p-2 rounded-2xl bg-card border border-border shadow-sm">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/map"
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white hover:scale-[1.02] transition-all shadow-2xs"
                  title="Lihat Peta Ragunan"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <AppIcon icon="MapPin" className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] truncate">
                    {language === 'en' ? 'Locate on Map' : 'Buka di Peta'}
                  </span>
                </Link>

                <button
                  id="quiz-btn"
                  onClick={() => setShowQuiz(true)}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-xs font-bold bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground hover:scale-[1.02] transition-all shadow-2xs"
                  title="Kuis Edukasi Flora"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <AppIcon icon="GraduationCap" className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] truncate">
                    {language === 'en' ? 'Plant Quiz' : 'Kuis Flora'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column: Botanical Metric Strip & About Story ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-5">

            {/* Botanical Metric Strip (4 Cards) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Metric 1: Location */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="MapPin" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'Garden Zone' : 'Titik / Zona Taman'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate mb-1">
                    {plant.location || plant.zone || (language === 'en' ? 'Ragunan Botanic Area' : 'Area Hutan Ragunan')}
                  </p>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{language === 'en' ? 'View on Map' : 'Buka di Peta'}</span>
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
                    {language === 'en' ? 'Habitat' : 'Habitat Asal'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {plantHabitat}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {language === 'en' ? 'Tropical Climate' : 'Iklim Tropis Basah'}
                  </p>
                </div>
              </div>

              {/* Metric 3: Category */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-lime-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="TreePine" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'Classification' : 'Klasifikasi'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {categoryLabel}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {plant.species || 'Plantae'}
                  </p>
                </div>
              </div>

              {/* Metric 4: Ecological Function */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between hover:border-teal-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                    <AppIcon icon="Sun" className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                    {language === 'en' ? 'Ecology Function' : 'Fungsi Ekologis'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground truncate">
                    {plant.status || (language === 'en' ? 'Canopy & Carbon Sink' : 'Peneduh & Serapan CO2')}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    {language === 'en' ? 'Biodiversity Buffer' : 'Paru-paru Hijau Jakarta'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-5 md:p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                    <AppIcon icon="Leaf" className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'en' ? 'Botany & Ecological Insights' : 'Mengenal Flora Ini'}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium">
                    {plant.latin_name ? plant.latin_name : plantName}
                  </span>
                </div>
                <p className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {plantDescription || (language === 'en'
                    ? 'Information about this botanical species is currently maintained by the Ragunan Zoo urban forest division.'
                    : 'Informasi botani dan peran ekologis tumbuhan ini dikurasi secara resmi oleh divisi keanekaragaman hayati dan kehutanan kota Taman Margasatwa Ragunan.')}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon icon="ShieldCheck" className="w-4 h-4 text-emerald-500" />
                  <span>{language === 'en' ? 'Conserved Flora of Ragunan Forest' : 'Flora Dilindungi Kawasan Hutan Ragunan'}</span>
                </span>
                <Link href="/flora" className="text-primary font-semibold hover:underline">
                  {language === 'en' ? 'Explore all flora →' : 'Lihat semua flora →'}
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ── Section: Peran Ekologis Flora Ragunan ── */}
        <div className="p-5 md:p-6 rounded-3xl bg-card border border-border/80 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-lime-500/15 text-lime-700 dark:text-lime-300 flex items-center justify-center flex-shrink-0">
              <AppIcon icon="TreePine" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground">
                {language === 'en' ? 'Ecological Roles of Ragunan Flora' : 'Peran Penting Flora Hutan Ragunan'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'How tropical trees maintain city microclimate and wildlife habitat' : 'Bagaimana kanopi pohon menjaga mikroklimat kota dan habitat satwa liar'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: language === 'en' ? 'Urban Carbon Sink' : 'Serapan Karbon Kota',
                desc: language === 'en'
                  ? 'Ragunan Zoo acts as a major green lung in South Jakarta, absorbing thousands of tons of emissions each year.'
                  : 'Kawasan hijau 147 hektar Ragunan menyerap emisi kendaraan dan menjaga kualitas udara Jakarta Selatan.',
              },
              {
                title: language === 'en' ? 'Wildlife Canopy' : 'Tempat Bertengger Satwa',
                desc: language === 'en'
                  ? 'Mature native trees provide essential foraging, nesting, and shelter for wild urban birds and insects.'
                  : 'Tajuk pohon menjadi sarang burung liar, lebah penyerbuk, dan koridor hidup satwa arboreal.',
              },
              {
                title: language === 'en' ? 'Water Conservation' : 'Konservasi Air Tanah',
                desc: language === 'en'
                  ? 'The extensive root system promotes rainwater infiltration and prevents urban flash floods.'
                  : 'Sistem perakaran pohon menahan erosi tanah dan mengisi kantong cadangan air tanah Jakarta.',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section: Rekomendasi Flora Lainnya ── */}
        {relatedPlants.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                  <AppIcon icon="Leaf" className="w-5 h-5 text-emerald-500" />
                  <span>{language === 'en' ? 'Explore More Botanical Treasures' : 'Jelajahi Koleksi Flora Lainnya'}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === 'en' ? 'Peculiar and ancient trees you can discover around the zoo' : 'Pohon peneduh dan tanaman unik lainnya di Ragunan Zoo'}
                </p>
              </div>

              <Link
                href="/flora"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>{language === 'en' ? 'View Catalog' : 'Katalog Flora'}</span>
                <AppIcon icon="ChevronRight" className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {relatedPlants.map((rel) => {
                const relName = (language === 'en' && rel.name_en) ? rel.name_en : rel.name;
                const relCategory = categories.find(c => c.id === rel.category_id);
                const relCategoryLabel = relCategory 
                  ? getText(relCategory.name_id, relCategory.name_en, relCategory.name_id) 
                  : (rel.species || 'Flora');

                return (
                  <ModernMediaCard
                    key={rel.id}
                    href={`/flora/${rel.id}`}
                    imageSrc={rel.image_url || '/placeholder.svg'}
                    imageAlt={relName}
                    title={relName}
                    subtitle={relCategoryLabel}
                    badgeText={rel.status || undefined}
                    badgeVariant="emerald"
                    metaLabel={rel.location || rel.zone || undefined}
                    metaIcon={<AppIcon icon="MapPin" className="w-3 h-3 text-white/90" />}
                    aspectRatio="square"
                    actionText={language === 'en' ? 'Details' : 'Lihat Detail'}
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
