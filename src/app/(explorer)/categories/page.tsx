"use client";

import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PawPrint, Leaf } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';

export default function Categories() {
  const { categories, loading, getFloraCategories, getFaunaCategories } = useCategories();
  const { getText, t, language } = useLanguage();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const floraCategories = getFloraCategories();
  const faunaCategories = getFaunaCategories();

  const CategoryCard = ({ category }: { category: typeof categories[0] }) => {
    const displayName = getText(category.name_id, category.name_en, category.name_id);
    const displayDesc = getText(category.description_id, category.description_en, '');

    return (
      <Link
        href={`/animals/category/${category.id}`}
        className="group relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/70"
      >
        {category.image_url ? (
          <div className="relative h-40 md:h-48">
            <img
              src={category.image_url}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            
            {/* Animal / Plant Vector Badge - Generous & Prominent */}
            <div className="absolute top-3 right-3 w-12 h-12 md:w-14 md:h-14 p-1.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CategoryIcon icon={category.icon} categoryName={category.name_id} type={category.type} className="w-full h-full" />
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-base md:text-lg group-hover:translate-x-1 transition-transform">
                {displayName}
              </h3>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-card/80 hover:bg-muted/40 h-44 md:h-52 flex flex-col justify-between border-t-2 border-primary/20">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 p-1 bg-primary/[0.04]">
              <CategoryIcon icon={category.icon} categoryName={category.name_id} type={category.type} className="w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                {displayName}
              </h3>
              {displayDesc && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{displayDesc}</p>
              )}
            </div>
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        {t('explore_by_category')}
      </h1>

      <Tabs defaultValue="fauna" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="fauna" className="gap-2">
            <PawPrint className="w-4 h-4" />
            Fauna ({faunaCategories.length})
          </TabsTrigger>
          <TabsTrigger value="flora" className="gap-2">
            <Leaf className="w-4 h-4" />
            Flora ({floraCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fauna">
          {faunaCategories.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' ? 'No fauna categories yet' : 'Belum ada kategori fauna'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {faunaCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flora">
          {floraCategories.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' ? 'No flora categories yet' : 'Belum ada kategori flora'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {floraCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
