import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes cache

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

export type AmbientThemeType = 'golden-safari' | 'rainforest-emerald';

export interface WeatherResponseData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  descriptionEn: string;
  icon: string;
  condition: 'sunny' | 'rainy' | 'cloudy';
  theme: AmbientThemeType;
  themeTitle: string;
  themeSubtitle: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
  recommendation: {
    id: string;
    en: string;
  };
  source: string;
}

// Map WMO codes to descriptions, icons, and ambient themes
function interpretWeatherCode(code: number, isDay: number, rainMm: number) {
  // Codes indicating rain or heavy moisture
  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      description: 'Gerimis Sejuk',
      descriptionEn: 'Cool Drizzle',
      icon: 'cloud-drizzle',
      condition: 'rainy' as const,
      theme: 'rainforest-emerald' as const,
      themeTitle: 'Rainforest Emerald Mist',
      themeSubtitle: 'Nuansa Hutan Hujan Zamrud dengan Rintik Embun Berembun',
      recommendation: {
        id: 'Udara sejuk & segar! Sangat pas untuk menjelajahi Pusat Primata Schmutzer indoor dan museum satwa.',
        en: 'Cool & refreshing air! Perfect time to explore indoor Schmutzer Primate Center and animal museum.',
      },
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code) || rainMm > 0.5) {
    return {
      description: 'Hujan Rintik Alami',
      descriptionEn: 'Natural Rainforest Rain',
      icon: 'cloud-rain',
      condition: 'rainy' as const,
      theme: 'rainforest-emerald' as const,
      themeTitle: 'Rainforest Emerald Mist',
      themeSubtitle: 'Nuansa Hutan Hujan Zamrud dengan Efek Rintik Air Beranimasi',
      recommendation: {
        id: 'Hujan membawa keteduhan kebun binatang! Nikmati shelter beratap, kafe rindang, dan wahana primata.',
        en: 'Rain brings soothing calm to the zoo! Enjoy covered shelters, lush cafes, and primate enclosures.',
      },
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      description: 'Hujan Lebat Disertai Kilat',
      descriptionEn: 'Thunderstorm',
      icon: 'cloud-lightning',
      condition: 'rainy' as const,
      theme: 'rainforest-emerald' as const,
      themeTitle: 'Rainforest Emerald Mist',
      themeSubtitle: 'Atmosfer Hutan Hujan Tropis Basah & Segar',
      recommendation: {
        id: 'Disarankan berlindung di area paviliun indoor edukasi satwa sambil menunggu cuaca reda.',
        en: 'Take shelter in indoor educational pavilions while waiting for the thunderstorm to pass.',
      },
    };
  }

  if ([3, 45, 48].includes(code)) {
    return {
      description: code === 3 ? 'Mendung Teduh' : 'Berkabut Alami',
      descriptionEn: code === 3 ? 'Overcast & Shaded' : 'Natural Mist & Fog',
      icon: code === 3 ? 'cloud' : 'cloud-fog',
      condition: 'cloudy' as const,
      theme: 'rainforest-emerald' as const,
      themeTitle: 'Rainforest Emerald Mist',
      themeSubtitle: 'Nuansa Hutan Hujan Rindang dengan Lapisan Kabut Halus',
      recommendation: {
        id: 'Suhu teduh tanpa terik matahari! Sangat nyaman untuk jalan santai mengelilingi danau satwa.',
        en: 'Pleasantly shaded temperature! Wonderful for a relaxing stroll around the wildlife lake.',
      },
    };
  }

  if ([1, 2].includes(code)) {
    return {
      description: 'Cerah Berawan',
      descriptionEn: 'Partly Cloudy',
      icon: isDay ? 'cloud-sun' : 'cloud',
      condition: 'sunny' as const,
      theme: 'golden-safari' as const,
      themeTitle: 'Golden Safari Sunlight',
      themeSubtitle: 'Nuansa Safari Keemasan dengan Bayangan Hangat Tropis',
      recommendation: {
        id: 'Cuaca sangat ideal! Satwa aktif di kandang terbuka, cocok untuk safari foto keluarga.',
        en: 'Ideal weather! Animals are active in open enclosures, great for family safari photography.',
      },
    };
  }

  // Code 0: Clear / Cerah
  return {
    description: isDay ? 'Cerah Hangat' : 'Malam Berbintang',
    descriptionEn: isDay ? 'Golden Sunny' : 'Clear Night',
    icon: 'sun',
    condition: 'sunny' as const,
    theme: 'golden-safari' as const,
    themeTitle: 'Golden Safari Sunlight',
    themeSubtitle: 'Nuansa Cahaya Mentari Safari Keemasan dengan Bayangan Hangat',
    recommendation: {
      id: 'Cuaca cerah sempurna! Kenakan topi atau kacamata hitam, lalu nikmati feeding show satwa.',
      en: 'Glorious sunny day! Wear a sun hat, bring water, and enjoy live animal feeding shows.',
    },
  };
}

export async function GET() {
  const latitude = -6.3025;
  const longitude = 106.8274;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FJakarta`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache 5 minutes
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error('Missing current weather data');
    }

    const weatherInfo = interpretWeatherCode(
      current.weather_code,
      current.is_day ?? 1,
      current.rain ?? 0
    );

    const result: WeatherResponseData = {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      description: weatherInfo.description,
      descriptionEn: weatherInfo.descriptionEn,
      icon: weatherInfo.icon,
      condition: weatherInfo.condition,
      theme: weatherInfo.theme,
      themeTitle: weatherInfo.themeTitle,
      themeSubtitle: weatherInfo.themeSubtitle,
      location: 'Taman Margasatwa Ragunan, Jakarta Selatan',
      coordinates: {
        latitude,
        longitude,
      },
      lastUpdated: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
      recommendation: weatherInfo.recommendation,
      source: 'BMKG / Open-Meteo Jakarta Realtime Station',
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.warn('[WEATHER API] Failed to fetch live weather, returning calibrated fallback:', error);
    
    // Calibrated fallback for Ragunan Jakarta
    const fallback: WeatherResponseData = {
      temperature: 30,
      humidity: 72,
      windSpeed: 9,
      description: 'Cerah Berawan',
      descriptionEn: 'Partly Cloudy',
      icon: 'sun',
      condition: 'sunny',
      theme: 'golden-safari',
      themeTitle: 'Golden Safari Sunlight',
      themeSubtitle: 'Nuansa Safari Keemasan dengan Bayangan Hangat',
      location: 'Taman Margasatwa Ragunan, Jakarta Selatan',
      coordinates: { latitude, longitude },
      lastUpdated: new Date().toISOString(),
      recommendation: {
        id: 'Cuaca sangat ideal! Satwa aktif di kandang terbuka, cocok untuk safari foto keluarga.',
        en: 'Ideal weather! Animals are active in open enclosures, great for family safari photography.',
      },
      source: 'BMKG / Ragunan Weather Calibrated',
    };

    return NextResponse.json(fallback);
  }
}
