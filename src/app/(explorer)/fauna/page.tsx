"use client";

import Link from 'next/link';
import { PawPrint, Search, MapPin, X, ArrowUpDown, ChevronRight, Brain, Sparkles, Star, Grid3X3, List, TrendingUp, Leaf, ArrowUpRight, Gamepad2, Check, Volume2, VolumeX } from 'lucide-react';
import { useAnimals, Animal } from '@/hooks/useAnimals';
import { useCategories } from '@/hooks/useCategories';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import LazyImage from '@/components/ui/LazyImage';
import DynamicAnimalQuiz from '@/components/quiz/DynamicAnimalQuiz';
import CategoryIcon from '@/components/ui/CategoryIcon';
import ModernMediaCard from '@/components/ui/ModernMediaCard';
import { wildlifeAudio } from '@/utils/WildlifeAudioSynthesizer';

import AtmosphericHeader from '@/components/ui/AtmosphericHeader';

type SortOption = 'name' | 'popularity';
type ViewMode = 'grid' | 'list';

export default function Animals() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [playingAnimalId, setPlayingAnimalId] = useState<number | null>(null);
  const { animals, loading: animalsLoading } = useAnimals();
  const { categories, loading: categoriesLoading, getFaunaCategories } = useCategories();
  const { language, getText } = useLanguage();

  const loading = animalsLoading || categoriesLoading;

  const [isGridVisible, setIsGridVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const quizSectionRef = useRef<HTMLDivElement>(null);

  const handleQuickAudio = (e: React.MouseEvent, animal: Animal) => {
    e.preventDefault();
    e.stopPropagation();

    if (playingAnimalId === animal.id) {
      wildlifeAudio.stopAll();
      setPlayingAnimalId(null);
      return;
    }

    setPlayingAnimalId(animal.id);
    const soundType = wildlifeAudio.detectSoundType(animal.name);
    wildlifeAudio.playAnimalSound(soundType, () => {
      setPlayingAnimalId(null);
    });
  };

  useEffect(() => {
    return () => {
      wildlifeAudio.stopAll();
    };
  }, []);

  useEffect(() => {
    if (!loading && animals.length > 0) {
      const timer = setTimeout(() => setIsGridVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading, animals.length]);

  const availableCategories = useMemo(() => getFaunaCategories(), [getFaunaCategories]);

  const filteredAndSortedAnimals = useMemo(() => {
    let result = animals.filter(animal => {
      const displayName = (language === 'en' && animal.name_en) ? animal.name_en : animal.name;
      const matchesSearch =
        displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (animal.latin_name && animal.latin_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
        (animal.category && animal.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      const matchesCategory = !selectedCategoryId || animal.category_id === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (language === 'en' && a.name_en) ? a.name_en : a.name;
        const nameB = (language === 'en' && b.name_en) ? b.name_en : b.name;
        return nameA.localeCompare(nameB);
      }
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      const popNameA = (language === 'en' && a.name_en) ? a.name_en : a.name;
      const popNameB = (language === 'en' && b.name_en) ? b.name_en : b.name;
      return popNameA.localeCompare(popNameB);
    });

    return result;
  }, [animals, debouncedSearchQuery, selectedCategoryId, sortBy, language]);

  const getCategoryLabel = (cat: typeof categories[0]) => getText(cat.name_id, cat.name_en, cat.name_id);

  const getSortLabel = (sort: SortOption) => ({
    name: language === 'en' ? 'Name (A-Z)' : 'Nama (A-Z)',
    popularity: language === 'en' ? 'Popularity' : 'Popularitas',
  }[sort]);

  const getAnimalCategory = (animal: typeof animals[0]) => categories.find(c => c.id === animal.category_id);

  return (
    <div className="animate-fade-in">

      {/* ══════════ HERO HEADER ══════════ */}
      <AtmosphericHeader
        theme="fauna"
        icon={<PawPrint className="w-5 h-5 md:w-6 md:h-6 text-emerald-200" />}
        title={language === 'en' ? 'Animals & Education' : 'Satwa & Edukasi'}
        description={
          language === 'en'
            ? 'Discover and learn about the amazing wildlife and conservation programs at Ragunan Zoo'
            : 'Temukan dan kenali lebih dekat satwa-satwa luar biasa serta program konservasi penghuni Ragunan'
        }
        breadcrumbs={[
          { label: language === 'en' ? 'Explore' : 'Jelajahi', icon: <Leaf className="w-3 h-3" /> },
          { label: language === 'en' ? 'Fauna Collection' : 'Koleksi Fauna' },
        ]}
        stats={
          !loading
            ? [
                {
                  icon: <PawPrint className="w-3.5 h-3.5" />,
                  label: `${animals.length} ${language === 'en' ? 'Species' : 'Spesies'}`,
                },
                {
                  icon: <Grid3X3 className="w-3.5 h-3.5" />,
                  label: `${availableCategories.length} ${language === 'en' ? 'Categories' : 'Kategori'}`,
                },
                {
                  icon: <Star className="w-3.5 h-3.5" />,
                  label: `${animals.filter(a => a.is_featured).length} ${language === 'en' ? 'Featured' : 'Ikonik'}`,
                },
              ]
            : undefined
        }
        rightContent={
          <button
            onClick={() => {
              setShowQuiz(!showQuiz);
              if (!showQuiz) {
                setTimeout(
                  () => quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                  100
                );
              }
            }}
            className={`group flex items-center gap-3 p-3.5 md:p-4 rounded-2xl border transition-all duration-300 text-left w-full md:w-auto md:min-w-[230px] backdrop-blur-md ${
              showQuiz
                ? 'bg-amber-500/25 border-amber-400/60 shadow-md shadow-amber-500/20'
                : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/35 shadow-sm'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 ${
                showQuiz
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-white/15 text-white group-hover:bg-amber-400 group-hover:text-amber-950'
              }`}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{language === 'en' ? 'Animal Quiz!' : 'Kuis Satwa!'}</span>
              </p>
              <p className="text-xs text-white/70">
                {language === 'en' ? 'Test your knowledge' : 'Uji wawasanmu'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  showQuiz ? 'rotate-90 text-amber-300' : 'group-hover:translate-x-0.5'
                }`}
              />
            </div>
          </button>
        }
      />

      {/* ══════════ QUIZ SECTION ══════════ */}
      {showQuiz && (
        <section ref={quizSectionRef} className="container mx-auto px-4 py-4 md:py-6 animate-in slide-in-from-top-4 duration-300">
          <DynamicAnimalQuiz
            categoryLabel={language === 'en' ? 'All Animals' : 'Semua Satwa'}
            categoryIcon="🎮"
            onClose={() => setShowQuiz(false)}
            isEmbedded={true}
          />
        </section>
      )}

      {/* ══════════ CATEGORY SELECTOR (unified, replaces cards + pills) ══════════ */}
      <section className="container mx-auto px-4 pt-6 pb-4">

        {/* Section header + search row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex-1">
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-primary" />
              {language === 'en' ? 'Browse by Category' : 'Pilih Kategori'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === 'en' ? 'Click a category to filter animals' : 'Klik kategori untuk melihat satwa'}
            </p>
          </div>

          {/* Search + Sort + View grouped together */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input Box */}
            <div className="relative w-full sm:w-56 md:w-64 h-10 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search animals...' : 'Cari satwa...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              {/* View Mode Toggle (Grid/List) */}
              <div className="flex items-center h-10 bg-card border border-border rounded-xl p-1 gap-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`h-8 px-2.5 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'grid' ? 'bg-primary text-white shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`} 
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`h-8 px-2.5 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'list' ? 'bg-primary text-white shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`} 
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1.5 h-10 px-3.5 bg-card border border-border rounded-xl hover:bg-muted hover:border-primary/40 transition-colors text-sm font-semibold whitespace-nowrap shadow-2xs text-foreground"
                >
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  <span>{getSortLabel(sortBy)}</span>
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-1.5 bg-card dark:bg-[#111C16] border border-border shadow-2xl shadow-black/20 rounded-2xl z-50 min-w-[190px] p-1.5 overflow-hidden animate-scale-in ring-1 ring-black/5 dark:ring-white/10">
                      {(['name', 'popularity'] as SortOption[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => { setSortBy(option); setShowSortMenu(false); }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors flex items-center justify-between ${
                            sortBy === option
                              ? 'bg-primary text-white shadow-xs'
                              : 'text-foreground hover:bg-muted hover:text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {option === 'popularity' ? <TrendingUp className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
                            <span>{getSortLabel(option)}</span>
                          </div>
                          {sortBy === option && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category cards — "Semua" + each category */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">

          {/* "Semua" card */}
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`group relative flex flex-col items-center gap-2.5 p-3.5 md:p-4 rounded-2xl transition-all duration-300 text-left bg-card ${
              selectedCategoryId === null
                ? 'border-2 border-primary ring-4 ring-primary/15 shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border border-border hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {selectedCategoryId === null && (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              selectedCategoryId === null
                ? 'bg-primary text-white shadow-md'
                : 'bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110'
            }`}>
              <PawPrint className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div className="text-center w-full">
              <p className={`font-bold text-xs md:text-sm leading-tight ${selectedCategoryId === null ? 'text-primary' : 'text-foreground group-hover:text-primary'} transition-colors`}>
                {language === 'en' ? 'All Animals' : 'Semua Satwa'}
              </p>
              <p className={`text-[11px] mt-0.5 font-semibold ${selectedCategoryId === null ? 'text-primary/80' : 'text-muted-foreground'}`}>
                {animals.length} {language === 'en' ? 'species' : 'spesies'}
              </p>
            </div>
          </button>

          {/* Per-category cards */}
          {availableCategories.map((cat, i) => {
            const count = animals.filter(a => a.category_id === cat.id).length;
            const pct = animals.length > 0 ? Math.round((count / animals.length) * 100) : 0;
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(isActive ? null : cat.id)}
                className={`group relative flex flex-col items-center gap-2.5 p-3.5 md:p-4 rounded-2xl transition-all duration-300 text-left bg-card ${
                  isActive
                    ? 'border-2 border-primary ring-4 ring-primary/15 shadow-lg shadow-primary/10 scale-[1.02]'
                    : 'border border-border hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 p-1.5 ${
                  isActive
                    ? 'bg-primary/20 ring-2 ring-primary shadow-md scale-105'
                    : 'bg-primary/5 group-hover:bg-primary/15 group-hover:scale-110'
                }`}>
                  <CategoryIcon icon={cat.icon} categoryName={cat.name_id} type="fauna" className="w-full h-full" />
                </div>
                <div className="text-center w-full">
                  <p className={`font-bold text-xs md:text-sm leading-tight ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'} transition-colors`}>
                    {getCategoryLabel(cat)}
                  </p>
                  <p className={`text-[11px] mt-0.5 font-semibold ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>
                    {count} {language === 'en' ? 'species' : 'spesies'}
                  </p>
                  {/* mini progress bar */}
                  <div className="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active filter summary bar */}
        {(selectedCategoryId || searchQuery) && (
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {selectedCategoryId && (() => {
                const activeCat = availableCategories.find(c => c.id === selectedCategoryId);
                return activeCat ? (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 text-xs">
                    <CategoryIcon icon={activeCat.icon} categoryName={activeCat.name_id} type="fauna" className="w-5 h-5" />
                    <span>{getCategoryLabel(activeCat)}</span>
                  </span>
                ) : null;
              })()}
              <span>{filteredAndSortedAnimals.length} {language === 'en' ? 'animals found' : 'satwa ditemukan'}</span>
            </div>
            <button
              onClick={() => { setSelectedCategoryId(null); setSearchQuery(''); }}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <X className="w-3 h-3" />
              {language === 'en' ? 'Clear' : 'Hapus'}
            </button>
          </div>
        )}
      </section>

      {/* ══════════ ANIMALS DISPLAY ══════════ */}
      <section className="container mx-auto px-4 pb-10">
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4' : 'flex flex-col gap-3'}>
            {[...Array(viewMode === 'grid' ? 8 : 5)].map((_, i) =>
              viewMode === 'grid' ? (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ) : (
                <div key={i} className="explorer-card flex gap-4 p-3 animate-pulse">
                  <div className="w-28 h-28 rounded-2xl bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-5 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div
            ref={gridRef}
            className={viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'
              : 'flex flex-col gap-3'
            }
          >
            {filteredAndSortedAnimals.map((animal, index) => {
              const category = getAnimalCategory(animal);
              const displayName = (language === 'en' && animal.name_en) ? animal.name_en : animal.name;

              if (viewMode === 'grid') {
                const badgeVariant = animal.status?.toLowerCase().includes('kritis')
                  ? 'rose'
                  : animal.status?.toLowerCase().includes('rentan')
                  ? 'amber'
                  : 'emerald';

                const isThisPlaying = playingAnimalId === animal.id;
                const quickAudioButton = (
                  <button
                    type="button"
                    onClick={(e) => handleQuickAudio(e, animal)}
                    className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 shadow-md ${
                      isThisPlaying
                        ? 'bg-amber-500 text-white border-amber-300 ring-4 ring-amber-400/40 scale-110'
                        : 'bg-black/55 hover:bg-black/80 text-white/90 hover:text-white border-white/20 hover:scale-110 active:scale-95'
                    }`}
                    title={isThisPlaying ? (language === 'en' ? 'Stop Sound' : 'Hentikan Suara') : (language === 'en' ? `Listen to ${displayName}'s sound` : `Dengarkan suara ${displayName}`)}
                  >
                    {isThisPlaying ? (
                      <span className="flex items-center gap-0.5 h-3.5 w-3.5 justify-center">
                        <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                        <span className="w-0.5 h-2 bg-white rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-3 bg-white rounded-full animate-pulse delay-150" />
                      </span>
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                );

                return (
                  <div
                    key={animal.id}
                    className={`transition-all duration-300 ${
                      isGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionDelay: `${Math.min(index * 40, 300)}ms` }}
                  >
                    <ModernMediaCard
                      href={`/animals/${animal.id}`}
                      imageSrc={animal.image_url || ''}
                      imageAlt={displayName}
                      title={displayName}
                      subtitle={category ? getCategoryLabel(category) : (animal.species || 'Fauna')}
                      badgeText={animal.status || undefined}
                      badgeVariant={badgeVariant}
                      metaLabel={animal.zone || animal.location || animal.habitat || undefined}
                      metaIcon={<MapPin className="w-3 h-3 text-white/90" />}
                      isFeatured={animal.is_featured}
                      quickAudioAction={quickAudioButton}
                      aspectRatio="standard"
                    />
                  </div>
                );
              }

              return (
                <Link
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  className={`group relative flex flex-col sm:flex-row gap-3.5 md:gap-5 p-3.5 md:p-4 rounded-2xl md:rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-500 ease-spring overflow-hidden cursor-pointer ${
                    isGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${Math.min(index * 35, 280)}ms` }}
                >
                  <div className="relative w-full sm:w-36 md:w-44 h-40 sm:h-36 md:h-auto flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-muted/60">
                    <LazyImage
                      src={animal.image_url || ''}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-spring"
                      wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {animal.is_featured && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-sm backdrop-blur-md">
                        <Sparkles className="w-2.5 h-2.5 fill-amber-900 text-amber-900" />
                        <span>Ikonik</span>
                      </div>
                    )}

                    {category && (
                      <div className="absolute bottom-2 left-2 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm">
                          <CategoryIcon icon={category.icon} categoryName={category.name_id} type="fauna" className="w-4 h-4" />
                          <span>{getCategoryLabel(category)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          {category && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1.5 border border-primary/20">
                              <CategoryIcon icon={category.icon} categoryName={category.name_id} type="fauna" className="w-4 h-4" />
                              <span>{getCategoryLabel(category)}</span>
                            </span>
                          )}
                          <h3 className="font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
                            {displayName}
                          </h3>
                          {animal.latin_name && (
                            <p className="text-xs text-muted-foreground italic mt-0.5 truncate">
                              {animal.latin_name}
                            </p>
                          )}
                        </div>

                        {animal.status && (
                          <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{animal.status}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {(language === 'en' && animal.description_en) ? animal.description_en : animal.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs">
                      {animal.location ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate font-medium">{animal.location}</span>
                        </div>
                      ) : <div />}

                      <div className="flex items-center gap-2">
                        {/* List Quick Sound Button */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAudio(e, animal)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            playingAnimalId === animal.id
                              ? 'bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400/30'
                              : 'bg-muted/70 hover:bg-muted text-foreground border-border/60 hover:border-primary/40'
                          }`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingAnimalId === animal.id ? 'animate-pulse' : ''}`} />
                          <span className="text-[11px]">{playingAnimalId === animal.id ? (language === 'en' ? 'Stop' : 'Hentikan') : (language === 'en' ? 'Listen' : 'Suara')}</span>
                        </button>

                        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          <span>{language === 'en' ? 'See Detail' : 'Lihat Detail'}</span>
                          <div className="w-6 h-6 rounded-full bg-muted/80 group-hover:bg-primary text-muted-foreground group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-110">
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredAndSortedAnimals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <PawPrint className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {language === 'en' ? 'No animals found' : 'Satwa tidak ditemukan'}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {language === 'en' ? 'Try adjusting your search or filter criteria' : 'Coba sesuaikan pencarian atau filter kamu'}
            </p>
            <button
              onClick={() => { setSelectedCategoryId(null); setSearchQuery(''); }}
              className="btn-explorer-primary text-sm px-5 py-2.5"
            >
              {language === 'en' ? 'Clear filters' : 'Hapus filter'}
            </button>
          </div>
        )}
      </section>

      {/* ══════════ FLOATING ACTIVE AUDIO PILL ══════════ */}
      {playingAnimalId && (() => {
        const currentAnimal = animals.find(a => a.id === playingAnimalId);
        if (!currentAnimal) return null;
        const currentName = (language === 'en' && currentAnimal.name_en) ? currentAnimal.name_en : currentAnimal.name;
        return (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/90 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white leading-none">{currentName}</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">{language === 'en' ? 'Natural acoustic call playing' : 'Memutar suara akustik alami'}</p>
            </div>
            <button
              onClick={() => { wildlifeAudio.stopAll(); setPlayingAnimalId(null); }}
              className="ml-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-colors"
            >
              {language === 'en' ? 'Stop' : 'Berhenti'}
            </button>
          </div>
        );
      })()}
    </div>
  );
}
