"use client";

import AppIcon from '@/components/ui/AppIcon';
import { useWeatherAmbient } from '@/contexts/WeatherAmbientContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Map icon string to AppIcon icon identifier & animation
const getWeatherIcon = (icon: string) => {
  switch (icon) {
    case 'sun':
      return { icon: 'solar:sun-bold-duotone', animation: 'animate-sun-rotate', color: 'text-amber-500' };
    case 'cloud':
      return { icon: 'solar:cloud-bold-duotone', animation: 'animate-cloud-drift', color: 'text-slate-400' };
    case 'cloud-sun':
      return { icon: 'solar:cloud-sun-bold-duotone', animation: 'animate-cloud-drift', color: 'text-amber-500' };
    case 'cloud-rain':
      return { icon: 'solar:cloud-rain-bold-duotone', animation: 'animate-rain-fall', color: 'text-emerald-500' };
    case 'cloud-drizzle':
      return { icon: 'solar:cloud-waterdrops-bold-duotone', animation: 'animate-rain-fall', color: 'text-teal-500' };
    case 'cloud-lightning':
      return { icon: 'solar:cloud-bolt-bold-duotone', animation: 'animate-lightning-flash', color: 'text-yellow-500' };
    case 'cloud-fog':
      return { icon: 'solar:fog-bold-duotone', animation: 'animate-pulse-soft', color: 'text-slate-400' };
    default:
      return { icon: 'solar:sun-bold-duotone', animation: 'animate-sun-pulse', color: 'text-amber-500' };
  }
};

export default function WeatherAtmosphereWidget() {
  const { weather, loading, refetch, themeMode, setThemeMode } = useWeatherAmbient();
  const { language } = useLanguage();

  const iconConfig = getWeatherIcon(weather?.icon || 'sun');

  const currentRecommendation = language === 'en'
    ? weather?.recommendation?.en || 'Ideal weather for touring the park and viewing wildlife.'
    : weather?.recommendation?.id || 'Waktu ideal untuk keliling Schmutzer & melihat atraksi satwa.';

  return (
    <div className="w-full">
      {/* ======================================================== */}
      {/* MOBILE LAYOUT: Clean, minimal native card               */}
      {/* ======================================================== */}
      <div className="md:hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-xs border border-border/60 rounded-3xl p-4 relative overflow-hidden space-y-2.5 transition-all">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 badge-live-pulse" />
            {language === 'en' ? 'Park Open • 06:00 - 16:00 WIB' : 'Taman Buka • 06:00 - 16:00 WIB'}
          </span>

          <button 
            onClick={() => refetch()}
            disabled={loading}
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 rounded-full hover:bg-muted/50"
            title={language === 'en' ? 'Refresh weather' : 'Perbarui cuaca'}
          >
            <AppIcon icon="solar:restart-bold" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {loading ? (
              <AppIcon icon="solar:restart-bold" className="w-5 h-5 text-amber-500 animate-spin" />
            ) : (
              <AppIcon icon={iconConfig.icon} className={`w-5 h-5 ${iconConfig.color} ${iconConfig.animation}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground">
              {loading ? 'Memuat cuaca...' : `${weather?.description || 'Cerah'} • ${weather?.temperature ?? 29}°C`}
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {currentRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP LAYOUT: Clean, minimal native pill              */}
      {/* ======================================================== */}
      <div className="hidden md:flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-border/60 shadow-2xs hover:shadow-sm rounded-full px-4 py-2 cursor-pointer transition-all duration-300 group">
              <div className="w-7 h-7 bg-amber-500/10 rounded-full flex items-center justify-center overflow-hidden">
                {loading ? (
                  <AppIcon icon="solar:restart-bold" className="w-3.5 h-3.5 text-secondary animate-spin" />
                ) : (
                  <AppIcon icon={iconConfig.icon} className={`w-3.5 h-3.5 ${iconConfig.color} ${iconConfig.animation} group-hover:scale-110 transition-transform`} />
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  {loading ? '...' : `${weather?.temperature ?? 29}°C`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {loading ? '' : weather?.description || 'Cerah'}
                </span>
              </div>

              <div className="w-px h-4 bg-border mx-1" />

              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Ragunan Zoo' : 'TM Ragunan'}
              </span>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  refetch();
                }}
                disabled={loading}
                className="p-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 ml-1 rounded-full hover:bg-muted"
                title={language === 'en' ? 'Refresh weather' : 'Perbarui cuaca'}
              >
                <AppIcon icon="solar:restart-bold" className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="p-3 bg-card border border-border shadow-lg rounded-2xl w-72 space-y-2.5 z-50">
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat data cuaca BMKG...</p>
            ) : weather ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <AppIcon icon={iconConfig.icon} className={`w-6 h-6 ${iconConfig.color} ${iconConfig.animation}`} />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{weather.description}</p>
                      <p className="text-[11px] text-muted-foreground">Jakarta Selatan</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-primary">{weather.temperature}°C</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/40">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <AppIcon icon="solar:drop-bold-duotone" className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        {language === 'en' ? 'Humidity' : 'Kelembaban'}
                      </p>
                      <p className="font-semibold text-foreground">{weather.humidity}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/40">
                    <div className="w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center">
                      <AppIcon icon="solar:wind-bold-duotone" className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        {language === 'en' ? 'Wind' : 'Angin'}
                      </p>
                      <p className="font-semibold text-foreground">{weather.windSpeed} km/h</p>
                    </div>
                  </div>
                </div>

                {/* Subtle, minimal mode toggle for testing */}
                <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border/70 text-[10px]">
                  <span className="text-muted-foreground">Tema:</span>
                  <div className="inline-flex rounded-lg bg-muted p-0.5">
                    <button
                      type="button"
                      onClick={() => setThemeMode('auto')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                        themeMode === 'auto' ? 'bg-background text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeMode('golden-safari')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                        themeMode === 'golden-safari' ? 'bg-background text-amber-600 shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ☀️ Cerah
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeMode('rainforest-emerald')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                        themeMode === 'rainforest-emerald' ? 'bg-background text-emerald-600 shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      🌧️ Hujan
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center pt-0.5 flex items-center justify-center gap-1">
                  <AppIcon icon="solar:map-point-bold-duotone" className="w-3 h-3 text-primary" />
                  <span>Taman Margasatwa Ragunan</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data cuaca tidak tersedia</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
