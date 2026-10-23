"use client";

import { Calendar, Clock, MapPin, ArrowUpRight, Sparkles, Utensils, GraduationCap } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useState } from 'react';
import { SkeletonEventCard } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import AtmosphericHeader from '@/components/ui/AtmosphericHeader';
import LazyImage from '@/components/ui/LazyImage';

export default function Events() {
  const [filterType, setFilterType] = useState<string>('all');
  const { events, loading } = useEvents();
  const { language, t, getText } = useLanguage();

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  const feedingCount = events.filter(e => e.type === 'feeding').length;
  const showCount = events.filter(e => e.type === 'show' || e.type === 'education').length;

  const getEventTypeLabel = (type: string | null) => {
    switch (type) {
      case 'feeding': return t('feeding_time');
      case 'education': return t('education');
      case 'show': return t('show');
      default: return type || 'Event';
    }
  };

  const getEventTypeColor = (type: string | null) => {
    switch (type) {
      case 'feeding': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'education': return 'bg-primary/10 text-primary border-primary/20';
      case 'show': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('date_not_set');
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="animate-fade-in">
      <AtmosphericHeader
        theme="events"
        icon={<Calendar className="w-5 h-5 md:w-6 md:h-6 text-amber-200" />}
        title={t('schedule_events')}
        description={t('dont_miss_events')}
        breadcrumbs={[
          { label: language === 'en' ? 'Explore' : 'Jelajahi' },
          { label: language === 'en' ? 'Schedule & Shows' : 'Jadwal & Atraksi' },
        ]}
        stats={
          !loading
            ? [
                {
                  icon: <Calendar className="w-3.5 h-3.5" />,
                  label: `${events.length} ${language === 'en' ? 'Schedules' : 'Jadwal Agenda'}`,
                },
                {
                  icon: <Utensils className="w-3.5 h-3.5" />,
                  label: `${feedingCount} Feeding Time`,
                },
                {
                  icon: <Sparkles className="w-3.5 h-3.5" />,
                  label: `${showCount} Edukasi & Show`,
                },
              ]
            : undefined
        }
      />

      {/* Filter */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => setFilterType('feeding')}
            className={`inline-flex items-center gap-1.5 px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              filterType === 'feeding'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-card border border-border hover:border-amber-500/50 text-foreground'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Feeding</span>
          </button>
          <button
            onClick={() => setFilterType('education')}
            className={`inline-flex items-center gap-1.5 px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              filterType === 'education'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border hover:border-primary/50 text-foreground'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Edukasi</span>
          </button>
          <button
            onClick={() => setFilterType('show')}
            className={`inline-flex items-center gap-1.5 px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              filterType === 'show'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card border border-border hover:border-emerald-600/50 text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Show</span>
          </button>
        </div>
      </section>

      {/* Events List */}
      <section className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map(i => (
              <SkeletonEventCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="group relative flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl md:rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 ease-spring"
              >
                {/* Visual / Time Block */}
                {event.image_url ? (
                  <div className="relative w-full sm:w-44 md:w-52 h-40 sm:h-auto flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-muted/60">
                    <LazyImage
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-spring"
                      wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Floating Time Pill */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{event.time || '10:30 WIB'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full sm:w-28 md:w-32 flex-shrink-0 bg-primary/5 dark:bg-primary/10 rounded-xl md:rounded-2xl p-3 flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 border border-primary/15 text-center">
                    <Clock className="w-4 h-4 text-primary sm:mb-1" />
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl md:text-2xl font-black text-primary tracking-tight">{event.time?.split(':')[0] || '00'}</span>
                      <span className="text-sm md:text-base font-bold text-primary/70">:{event.time?.split(':')[1] || '00'}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">WIB</span>
                  </div>
                )}

                {/* Content Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    {/* Top Row Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold border ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Calendar className="w-3 h-3 text-primary/70" />
                        <span>{formatDate(event.event_date)}</span>
                      </span>
                    </div>

                    {/* Event Title */}
                    <h3 className="font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-200 leading-snug mb-1.5">
                      {event.title}
                    </h3>

                    {/* Event Description */}
                    {event.description && (
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border/50 text-xs">
                    {event.location ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="truncate font-medium text-[11px] sm:text-xs">{event.location}</span>
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>Detail Agenda</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('no_events_filter')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
