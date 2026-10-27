import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAvailabilityCalendar, ServiceAvailability } from '@/hooks/useServiceAvailability';
import { id as idLocale, enUS } from 'date-fns/locale';
import { AppIcon } from '@/components/ui/AppIcon';

interface AvailabilityCalendarProps {
  programType: 'pkl' | 'research' | 'koas' | 'interview';
  selectedDate?: Date;
  onSelectDate: (date: Date | undefined) => void;
  language: 'id' | 'en';
}

export default function AvailabilityCalendar({
  programType,
  selectedDate,
  onSelectDate,
  language
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: availability, isLoading } = useAvailabilityCalendar(programType, currentMonth);

  const texts = {
    id: {
      available: 'Tersedia',
      limited: 'Terbatas',
      full: 'Penuh',
      closed: 'Tutup',
      loading: 'Memuat...',
      legend: 'Keterangan',
      slots: 'slot',
    },
    en: {
      available: 'Available',
      limited: 'Limited',
      full: 'Full',
      closed: 'Closed',
      loading: 'Loading...',
      legend: 'Legend',
      slots: 'slots',
    }
  };

  const t = texts[language];

  const getDateStatus = (date: Date): { status: 'available' | 'limited' | 'full' | 'closed' | 'unknown'; slots?: number; maxSlots?: number } => {
    const dateStr = date.toISOString().split('T')[0];
    const avail = availability?.[dateStr];

    if (!avail) {
      // Weekend default to closed
      if (date.getDay() === 0 || date.getDay() === 6) {
        return { status: 'closed' };
      }
      return { status: 'unknown' };
    }

    if (!avail.is_available) {
      return { status: 'closed' };
    }

    const remaining = avail.max_slots - avail.booked_slots;
    
    if (remaining <= 0) {
      return { status: 'full', slots: 0, maxSlots: avail.max_slots };
    }
    
    if (remaining <= Math.ceil(avail.max_slots * 0.3)) {
      return { status: 'limited', slots: remaining, maxSlots: avail.max_slots };
    }

    return { status: 'available', slots: remaining, maxSlots: avail.max_slots };
  };

  const modifiers = {
    available: (date: Date) => getDateStatus(date).status === 'available',
    limited: (date: Date) => getDateStatus(date).status === 'limited',
    full: (date: Date) => getDateStatus(date).status === 'full',
    closed: (date: Date) => getDateStatus(date).status === 'closed',
  };

  const modifiersClassNames = {
    available: 'bg-green-100 text-green-800 hover:bg-green-200 font-medium',
    limited: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-medium',
    full: 'bg-red-100 text-red-600 hover:bg-red-200 cursor-not-allowed opacity-60',
    closed: 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50',
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const status = getDateStatus(date);
      if (status.status === 'full' || status.status === 'closed') {
        return; // Don't allow selection of full or closed dates
      }
    }
    onSelectDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <AppIcon name="solar:spinner-linear" className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        locale={language === 'id' ? idLocale : enUS}
        onMonthChange={setCurrentMonth}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        disabled={(date) => {
          const status = getDateStatus(date);
          return date < new Date() || status.status === 'full' || status.status === 'closed';
        }}
        className={cn("rounded-lg border p-3 pointer-events-auto")}
      />

      {/* Selected date info */}
      {selectedDate && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <AppIcon name="solar:check-circle-bold" className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {selectedDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          {(() => {
            const status = getDateStatus(selectedDate);
            if (status.slots !== undefined) {
              return (
                <p className="text-xs text-muted-foreground mt-1">
                  {status.slots} {t.slots} {language === 'id' ? 'tersedia dari' : 'available of'} {status.maxSlots}
                </p>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">{t.legend}:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span>{t.available}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
            <span>{t.limited}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span>{t.full}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
            <span>{t.closed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
