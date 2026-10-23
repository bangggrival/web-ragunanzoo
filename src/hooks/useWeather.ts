import { useWeatherAmbient, WeatherAmbientContextType } from '@/contexts/WeatherAmbientContext';
import type { WeatherResponseData } from '@/app/api/weather/route';

export type WeatherData = WeatherResponseData;

export function useWeather() {
  try {
    const context = useWeatherAmbient();
    return {
      weather: context.weather,
      loading: context.loading,
      error: context.error,
      refetch: context.refetch,
      activeTheme: context.activeTheme,
      themeMode: context.themeMode,
      setThemeMode: context.setThemeMode,
      isAuto: context.isAuto,
    };
  } catch {
    // Fallback if rendered outside WeatherAmbientProvider
    return {
      weather: {
        temperature: 30,
        humidity: 70,
        windSpeed: 10,
        description: 'Cerah',
        descriptionEn: 'Sunny',
        icon: 'sun',
        condition: 'sunny' as const,
        theme: 'golden-safari' as const,
        themeTitle: 'Golden Safari Sunlight',
        themeSubtitle: 'Nuansa Safari Keemasan dengan Bayangan Hangat',
        location: 'Taman Margasatwa Ragunan',
        coordinates: { latitude: -6.3025, longitude: 106.8274 },
        lastUpdated: new Date().toISOString(),
        recommendation: {
          id: 'Cuaca ideal untuk berkeliling taman dan melihat atraksi satwa.',
          en: 'Ideal weather for exploring the park and viewing animal attractions.',
        },
        source: 'BMKG / Ragunan Weather Calibrated',
      },
      loading: false,
      error: null,
      refetch: async () => {},
      activeTheme: 'golden-safari' as const,
      themeMode: 'auto' as const,
      setThemeMode: () => {},
      isAuto: true,
    };
  }
}
