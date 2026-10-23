"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { WeatherResponseData, AmbientThemeType } from '@/app/api/weather/route';

export type AmbientThemeMode = 'auto' | 'golden-safari' | 'rainforest-emerald';
export type ActiveAmbientTheme = AmbientThemeType;

export interface WeatherAmbientContextType {
  weather: WeatherResponseData | null;
  loading: boolean;
  error: string | null;
  activeTheme: ActiveAmbientTheme;
  themeMode: AmbientThemeMode;
  setThemeMode: (mode: AmbientThemeMode) => void;
  refetch: () => Promise<void>;
  isAuto: boolean;
}

const WeatherAmbientContext = createContext<WeatherAmbientContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ragunan_ambient_weather_mode';

// Default fallback when offline or loading
const DEFAULT_WEATHER: WeatherResponseData = {
  temperature: 29,
  humidity: 68,
  windSpeed: 8,
  description: 'Cerah Berawan',
  descriptionEn: 'Partly Cloudy',
  icon: 'sun',
  condition: 'sunny',
  theme: 'golden-safari',
  themeTitle: 'Golden Safari Sunlight',
  themeSubtitle: 'Nuansa Safari Keemasan dengan Bayangan Hangat',
  location: 'Taman Margasatwa Ragunan, Jakarta Selatan',
  coordinates: { latitude: -6.3025, longitude: 106.8274 },
  lastUpdated: new Date().toISOString(),
  recommendation: {
    id: 'Cuaca sangat ideal! Satwa aktif di kandang terbuka, cocok untuk safari foto keluarga.',
    en: 'Ideal weather! Animals are active in open enclosures, great for family safari photography.',
  },
  source: 'BMKG / Ragunan Realtime',
};

export const WeatherAmbientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [themeMode, setThemeModeState] = useState<AmbientThemeMode>('auto');

  // Load user preference for theme mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as AmbientThemeMode | null;
      if (saved && ['auto', 'golden-safari', 'rainforest-emerald'].includes(saved)) {
        setThemeModeState(saved);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setThemeMode = useCallback((mode: AmbientThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, mode);
    } catch {
      // Ignore localStorage write failures in private/incognito browsing
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Weather API returned status: ${res.status}`);
      }

      const data: WeatherResponseData = await res.json();
      setWeather(data);
    } catch (err) {
      console.warn('[WEATHER HOOK] Failed to fetch live weather:', err);
      setError((err as Error).message || 'Gagal memuat cuaca');
      setWeather(prev => prev ?? DEFAULT_WEATHER);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Determine active theme based on mode
  const activeTheme: ActiveAmbientTheme = useMemo(() => {
    if (themeMode === 'golden-safari') return 'golden-safari';
    if (themeMode === 'rainforest-emerald') return 'rainforest-emerald';
    return weather?.theme || 'golden-safari';
  }, [themeMode, weather]);

  // Synchronize dynamic attributes on document body for theme styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-ambient-theme', activeTheme);
      document.body.setAttribute('data-ambient-theme', activeTheme);
    }
  }, [activeTheme]);

  const value = useMemo(
    () => ({
      weather: weather || DEFAULT_WEATHER,
      loading,
      error,
      activeTheme,
      themeMode,
      setThemeMode,
      refetch: fetchWeather,
      isAuto: themeMode === 'auto',
    }),
    [weather, loading, error, activeTheme, themeMode, setThemeMode, fetchWeather]
  );

  return (
    <WeatherAmbientContext.Provider value={value}>
      {children}
    </WeatherAmbientContext.Provider>
  );
};

export function useWeatherAmbient(): WeatherAmbientContextType {
  const context = useContext(WeatherAmbientContext);
  if (!context) {
    throw new Error('useWeatherAmbient must be used within a WeatherAmbientProvider');
  }
  return context;
}
