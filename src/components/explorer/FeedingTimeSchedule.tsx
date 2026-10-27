'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { AppIcon } from '@/components/ui/AppIcon';
import Image from 'next/image';
import { useFeedingSchedules, FeedingSchedule } from '@/hooks/useFeedingSchedules';

interface NextFeeding {
  schedule: FeedingSchedule;
  timeString: string; // "HH:MM"
  dateObj: Date;
  isTomorrow: boolean;
}

const FEEDING_DURATION_MS = 20 * 60 * 1000; // 20 minutes active feeding window

export default function FeedingTimeSchedule() {
  const { language } = useLanguage();
  const lang = language as 'id' | 'en';
  
  const { schedules, loading, fetchSchedules } = useFeedingSchedules();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextFeeding, setNextFeeding] = useState<NextFeeding | null>(null);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchSchedules(true);
  }, [fetchSchedules]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMinute = currentTime.getMinutes();

  // Calculate the absolute next feeding time across all animals
  useEffect(() => {
    const now = new Date();
    
    let upcoming: NextFeeding | null = null;
    let minDiffMs = Infinity;

    // Check today's feedings (including any session currently in progress within 20 mins)
    schedules.forEach(schedule => {
      schedule.times?.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const feedTime = new Date(now);
        feedTime.setHours(hours, minutes, 0, 0);

        const diffMs = feedTime.getTime() - now.getTime();
        
        // If it's happening right now (within 20 mins) or in the future
        if (diffMs >= -FEEDING_DURATION_MS && diffMs < minDiffMs) {
          minDiffMs = diffMs;
          upcoming = {
            schedule,
            timeString: timeStr,
            dateObj: feedTime,
            isTomorrow: false
          };
        }
      });
    });

    // If no more feedings today, find the first feeding tomorrow
    if (!upcoming) {
      let earliestTimeMs = Infinity;
      schedules.forEach(schedule => {
        schedule.times?.forEach(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const feedTime = new Date(now);
          feedTime.setDate(feedTime.getDate() + 1); // Tomorrow
          feedTime.setHours(hours, minutes, 0, 0);

          const timeMs = feedTime.getTime();
          if (timeMs < earliestTimeMs) {
            earliestTimeMs = timeMs;
            upcoming = {
              schedule,
              timeString: timeStr,
              dateObj: feedTime,
              isTomorrow: true
            };
          }
        });
      });
    }

    setNextFeeding(upcoming);
  }, [currentMinute, schedules]); // Recalculate which one is "next" every minute, not every second

  // Calculate countdown relative to current time
  useEffect(() => {
    if (!nextFeeding) return;

    const diffMs = nextFeeding.dateObj.getTime() - currentTime.getTime();
    
    if (diffMs <= 0) {
      // It's happening right now!
      setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    setCountdown({ hours, minutes, seconds });
  }, [currentTime, nextFeeding]);

  // UI Texts
  const t = {
    id: {
      title: 'Jadwal Makan Satwa',
      subtitle: 'Jangan lewatkan momen seru melihat satwa favoritmu bersantap!',
      nextUp: 'Selanjutnya',
      happeningNow: 'Sedang Berlangsung!',
      hours: 'Jam',
      minutes: 'Menit',
      seconds: 'Detik',
      tomorrow: 'Besok',
      today: 'Hari ini',
      allSchedules: 'Semua Jadwal'
    },
    en: {
      title: 'Feeding Time Schedule',
      subtitle: 'Don\'t miss the exciting moment of seeing your favorite animals eat!',
      nextUp: 'Next Up',
      happeningNow: 'Happening Now!',
      hours: 'Hrs',
      minutes: 'Min',
      seconds: 'Sec',
      tomorrow: 'Tomorrow',
      today: 'Today',
      allSchedules: 'All Schedules'
    }
  }[lang];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AppIcon name="solar:spinner-linear" className="w-8 h-8 animate-spin mb-4" />
        <p>Memuat jadwal makan satwa...</p>
      </div>
    );
  }

  if (!nextFeeding || schedules.length === 0) return null;

  const isHappeningNow = countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  const isApproaching = countdown.hours === 0 && countdown.minutes < 15; // less than 15 mins

  return (
    <section className="py-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 ring-1 ring-primary/20 shadow-sm">
            <AppIcon name="fluent-emoji-flat:fork-and-knife-with-plate" className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">{t.title}</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Countdown Banner */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden border border-white/10 shadow-2xl bg-black relative h-full min-h-[280px] rounded-[2rem] group">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0 text-white/50">
                {nextFeeding.schedule.image_url ? (
                  <Image 
                    src={nextFeeding.schedule.image_url} 
                    alt={nextFeeding.schedule.name_en}
                    fill
                    className="object-cover object-center transition-transform duration-1000 group-hover:scale-105 opacity-80"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/20" />
                )}
                <div className={`absolute inset-0 bg-gradient-to-tr ${nextFeeding.schedule.color || 'from-primary/20 to-secondary/20'} mix-blend-overlay`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <CardContent className="relative z-10 p-5 sm:p-8 md:p-10 h-full flex flex-col justify-end text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1.5 bg-primary/90 text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/20">
                    {isHappeningNow ? (
                      <AppIcon name="solar:danger-circle-bold" className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <AppIcon name="solar:clock-circle-bold" className="w-3.5 h-3.5" />
                    )}
                    {isHappeningNow ? t.happeningNow : t.nextUp}
                  </div>
                  <span className="text-white/90 text-sm font-semibold tracking-wide drop-shadow-md">
                    {nextFeeding.isTomorrow ? t.tomorrow : t.today} • {nextFeeding.timeString}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-6 text-white drop-shadow-xl tracking-tight leading-tight line-clamp-2">
                  {lang === 'en' ? nextFeeding.schedule.name_en : nextFeeding.schedule.name_id}
                </h3>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                      <span className="text-3xl md:text-4xl font-bold font-mono tracking-tighter text-white">
                        {countdown.hours.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-white/80 mt-2 uppercase tracking-widest">{t.hours}</span>
                  </div>
                  
                  <span className="text-2xl md:text-3xl font-bold text-white/50 -mt-6">:</span>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                      <span className="text-3xl md:text-4xl font-bold font-mono tracking-tighter text-white">
                        {countdown.minutes.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-white/80 mt-2 uppercase tracking-widest">{t.minutes}</span>
                  </div>

                  <span className="text-2xl md:text-3xl font-bold text-white/50 -mt-6">:</span>

                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 backdrop-blur-md rounded-2xl flex items-center justify-center border shadow-2xl transition-all duration-500 ${isApproaching ? 'bg-primary/40 border-primary/50 ring-2 ring-primary/30' : 'bg-black/40 border-white/20'}`}>
                      <span className={`text-3xl md:text-4xl font-bold font-mono tracking-tighter ${isApproaching ? 'text-white' : 'text-white'}`}>
                        {countdown.seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className={`text-[10px] md:text-xs font-semibold mt-2 uppercase tracking-widest ${isApproaching ? 'text-primary-foreground drop-shadow-md' : 'text-white/80'}`}>{t.seconds}</span>
                  </div>
                </div>

                {/* Map Route Shortcut Button */}
                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs transition-all shadow-md btn-interactive"
                  >
                    <AppIcon name="solar:map-point-bold" className="w-3.5 h-3.5 text-white/90" />
                    <span>{lang === 'en' ? 'View Enclosure on Map' : 'Lihat Lokasi Kandang di Peta'}</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule List */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <Card className="flex-1 border border-border/70 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] bg-card rounded-2xl md:rounded-3xl overflow-hidden flex flex-col">
              <div className="p-5 bg-muted/40 border-b border-border/70">
                <h4 className="font-bold text-base md:text-lg flex items-center gap-2.5">
                  <AppIcon name="fluent-emoji-flat:fork-and-knife-with-plate" className="w-5 h-5 text-primary" />
                  {t.allSchedules}
                </h4>
              </div>
              <CardContent className="p-2 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-1.5 p-2">
                  {schedules.map((schedule) => (
                    <div 
                      key={schedule.id} 
                      className={`p-3 rounded-xl md:rounded-2xl flex items-center gap-3.5 transition-all duration-300 cursor-pointer hover:bg-muted/60 ${nextFeeding.schedule.id === schedule.id ? 'bg-primary/5 shadow-2xs ring-1 ring-primary/25' : ''}`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden relative flex-shrink-0 shadow-md bg-muted">
                        {schedule.image_url ? (
                          <Image 
                            src={schedule.image_url} 
                            alt={schedule.name_id}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <AppIcon name="fluent-emoji-flat:fork-and-knife-with-plate" className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm md:text-base truncate text-foreground mb-1.5">
                          {lang === 'en' ? schedule.name_en : schedule.name_id}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {schedule.times?.map((time, idx) => {
                            const isNext = nextFeeding.schedule.id === schedule.id && nextFeeding.timeString === time && !nextFeeding.isTomorrow;
                            return (
                              <span 
                                key={idx} 
                                className={`text-[11px] px-2.5 py-1 rounded-md font-bold tracking-wider transition-colors ${isNext ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted-foreground/10 text-muted-foreground'}`}
                              >
                                {time}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
