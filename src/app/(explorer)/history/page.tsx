"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrganizationMemberships } from '@/hooks/useOrganizationMemberships';
import { History, TreePine, Leaf, Calendar, ChevronDown, Award, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ZooHistory {
  id: string;
  title_id: string;
  title_en: string | null;
  content_id: string;
  content_en: string | null;
  year: number | null;
  image_url: string | null;
  order_index: number;
  is_published: boolean;
}

export default function HistoryPage() {
  const { language, t } = useLanguage();
  const { activeOrganizations, loading: orgLoading } = useOrganizationMemberships();

  const { data: historyItems, isLoading } = useQuery({
    queryKey: ['zoo-history-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zoo_history')
        .select('*')
        .eq('is_published', true)
        .order('year', { ascending: true });

      if (error) throw error;
      return data as ZooHistory[];
    },
  });

  const getText = (item: ZooHistory, field: 'title' | 'content') => {
    if (field === 'title') {
      return language === 'en' ? (item.title_en || item.title_id) : item.title_id;
    }
    return language === 'en' ? (item.content_en || item.content_id) : item.content_id;
  };

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Hero Header with Forest Theme */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-8 md:py-12 overflow-hidden">
        {/* Forest Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <TreePine className="absolute top-4 left-4 w-20 h-20 md:w-32 md:h-32 opacity-10" />
          <Leaf className="absolute top-10 right-10 w-16 h-16 md:w-24 md:h-24 opacity-10 rotate-45" />
          <TreePine className="absolute bottom-0 right-1/4 w-24 h-24 md:w-40 md:h-40 opacity-10" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold">
              {language === 'en' ? 'Our History' : 'Sejarah Kami'}
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm md:text-lg max-w-2xl">
            {language === 'en' 
              ? 'Discover the rich heritage and milestones of our zoo through the years'
              : 'Temukan warisan dan pencapaian kebun binatang kami sepanjang waktu'}
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 md:gap-8">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-0.5 h-32 mt-2" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : historyItems && historyItems.length > 0 ? (
          <div className="relative">
            {/* Central Timeline Line - Hidden on mobile */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent -translate-x-1/2" />
            
            {/* Mobile Timeline Line */}
            <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            <div className="space-y-8 md:space-y-12">
              {historyItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={cn(
                    "relative flex gap-4 md:gap-0",
                    "opacity-0 animate-fade-in-up",
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Year Badge - Mobile */}
                  <div className="md:hidden flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                      {item.year || '—'}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 md:w-[calc(50%-3rem)]",
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  )}>
                    <div className="explorer-card overflow-hidden group">
                      {/* Forest-themed header */}
                      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
                        <TreePine className="absolute top-2 right-2 w-8 h-8 opacity-10" />
                        
                        {/* Year Badge - Desktop */}
                        <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.year || '—'}
                        </div>
                        
                        <h3 className={cn(
                          "text-lg md:text-xl font-bold text-foreground",
                          index % 2 === 0 ? "md:text-right" : ""
                        )}>
                          {getText(item, 'title')}
                        </h3>
                      </div>

                      {item.image_url && (
                        <div className="w-full h-40 md:h-48 overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={getText(item, 'title')} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <p className={cn(
                          "text-sm md:text-base text-muted-foreground leading-relaxed",
                          index % 2 === 0 ? "md:text-right" : ""
                        )}>
                          {getText(item, 'content')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Center Timeline Dot - Desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" 
                    style={{ top: '2rem' }}
                  />

                  {/* Spacer for alternating layout - Desktop */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            {historyItems.length > 3 && (
              <div className="flex justify-center mt-8 md:mt-12 animate-bounce-slow">
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <History className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'en' ? 'No History Available' : 'Belum Ada Sejarah'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'en' 
                ? 'History content will be added soon'
                : 'Konten sejarah akan segera ditambahkan'}
            </p>
          </div>
        )}
      </section>

      {/* Organizations & Affiliations */}
      <section className="bg-gradient-to-b from-transparent to-muted/30 py-12 md:py-20 border-t border-border/50">
        <div className="container mx-auto px-4 text-center max-w-6xl">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
            <Award className="w-4 h-4" />
            {language === 'en' ? 'Global Network' : 'Jaringan & Afiliasi'}
          </div>
          
          <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4">
            {language === 'en' ? 'Memberships & Affiliations' : 'Keanggotaan & Afiliasi'}
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {language === 'en' 
              ? 'Ragunan Zoo operates under the Jakarta Provincial Government and is an active member of leading national, regional, and global zoo and aquarium conservation networks.'
              : 'Taman Margasatwa Ragunan beroperasi di bawah Pemerintah Provinsi DKI Jakarta dan terafiliasi dengan jejaring konservasi kebun binatang terkemuka tingkat nasional, regional, dan dunia.'}
          </p>

          {orgLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-56 rounded-3xl w-full" />
              ))}
            </div>
          ) : activeOrganizations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {activeOrganizations.map((org, i) => (
                <a 
                  key={org.id}
                  href={org.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-between p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 text-center min-h-[250px]"
                  style={{ animationDelay: `${i * 80}ms` }}
                  title={org.full_name || org.name}
                >
                  {/* Subtle top indicator */}
                  <div className="w-full flex items-center justify-between text-[11px] font-semibold text-muted-foreground/80 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-muted/70 dark:bg-slate-800/80 text-[10px] font-bold tracking-wider text-muted-foreground">
                      {i === 0 ? 'Pemprov' : i === 1 ? 'Instansi' : i === 2 ? 'Nasional' : i === 3 ? 'Regional' : 'Dunia'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Logo Podium */}
                  <div className="w-24 h-24 my-auto rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-sm group-hover:shadow-md flex items-center justify-center p-3 transition-all duration-300 group-hover:scale-110">
                    {org.logo_url ? (
                      <img 
                        src={org.logo_url} 
                        alt={org.name} 
                        className="max-w-full max-h-full object-contain filter drop-shadow-sm transition-transform duration-300" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {org.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Details */}
                  <div className="mt-auto w-full pt-3">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {org.name}
                    </h3>
                    {org.full_name && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 font-medium leading-tight">
                        {org.full_name}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
