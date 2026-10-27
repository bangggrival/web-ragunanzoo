"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useAnimals } from '@/hooks/useAnimals';
import { useCategories } from '@/hooks/useCategories';
import { useState, useMemo } from 'react';
import { SkeletonAnimalCard } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import DynamicAnimalQuiz from '@/components/quiz/DynamicAnimalQuiz';
import PageHeader from '@/components/ui/PageHeader';
import ModernMediaCard from '@/components/ui/ModernMediaCard';
import CategoryIcon from '@/components/ui/CategoryIcon';



export default function CategoryDetail() {
  const { categoryId } = useParams() as { categoryId: string };
  const router = useRouter();
  const { animals, loading: animalsLoading, getAnimalsByCategoryId } = useAnimals();
  const { categories, loading: categoriesLoading } = useCategories();
  const { language, getText } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);

  const loading = animalsLoading || categoriesLoading;

  // Find the category by ID
  const category = useMemo(() => {
    return categories.find(c => c.id === categoryId);
  }, [categoryId, categories]);

  // Filter animals by category_id
  const categoryAnimals = useMemo(() => {
    if (!categoryId) return [];
    return getAnimalsByCategoryId(categoryId);
  }, [categoryId, getAnimalsByCategoryId]);

  const getAnimalImage = (imageUrl: string | null) => {
    return imageUrl || '';
  };

  useEffect(() => {
    if (!loading && !category) {
      router.replace('/fauna');
    }
  }, [loading, category, router]);

  if (!loading && !category) {
    return null;
  }

  const categoryLabel = category ? getText(category.name_id, category.name_en, category.name_id) : '';
  const categoryDescription = category ? getText(category.description_id, category.description_en, '') : '';

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white/40 flex items-center justify-center p-1 bg-white/20 backdrop-blur-md">
            <CategoryIcon 
              icon={category?.icon} 
              categoryName={category?.name_id} 
              type="fauna" 
              className="w-full h-full" 
            />
          </div>
        }
        title={categoryLabel}
        description={`${categoryAnimals.length} ${language === 'en' ? 'animals' : 'satwa'}`}
        backPath="/fauna"
        backLabel={language === 'en' ? 'Back to All Animals' : 'Kembali ke Semua Satwa'}
      />

      {/* Educational Info */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="bg-card rounded-2xl border border-border p-4 md:p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AppIcon icon="Info" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg mb-1">
                {language === 'en' ? `About ${categoryLabel}` : `Tentang ${categoryLabel}`}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {categoryDescription || (language === 'en' ? 'Learn more about this category' : 'Pelajari lebih lanjut tentang kategori ini')}
              </p>
            </div>
          </div>

          {/* Quiz Button */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setShowQuiz(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              <AppIcon icon="Gamepad2" className="w-5 h-5" />
              {language === 'en' ? 'Take the Quiz!' : 'Main Kuis!'}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {language === 'en' 
                ? 'Test your knowledge about this category!'
                : 'Uji pengetahuanmu tentang kategori ini!'}
            </p>
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="container mx-auto px-4 pb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          {language === 'en' ? `${categoryLabel} at Ragunan Zoo` : `${categoryLabel} di Ragunan`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/3] rounded-2xl md:rounded-3xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {categoryAnimals.map((animal) => {
              const displayName = (language === 'en' && animal.name_en) ? animal.name_en : animal.name;
              return (
                <ModernMediaCard
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  imageSrc={getAnimalImage(animal.image_url)}
                  imageAlt={displayName}
                  title={displayName}
                  subtitle={animal.latin_name || undefined}
                  metaLabel={animal.location || undefined}
                  isFeatured={animal.is_featured}
                  badgeText={animal.status ? (language === 'en' ? 'Protected' : 'Dilindungi') : undefined}
                  badgeVariant="emerald"
                  aspectRatio="standard"
                  actionText={language === 'en' ? 'Animal Profile' : 'Profil Satwa'}
                />
              );
            })}
          </div>
        )}

        {!loading && categoryAnimals.length === 0 && (
          <div className="text-center py-12">
            <AppIcon icon="PawPrint" className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm md:text-base">
              {language === 'en' ? 'No animals in this category yet' : 'Belum ada satwa dalam kategori ini'}
            </p>
          </div>
        )}
      </section>


      {/* Quiz Modal */}
      {showQuiz && category && (
        <DynamicAnimalQuiz
          categoryId={category.id}
          categoryLabel={categoryLabel}
          categoryIcon={category.icon || '🐾'}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
}
