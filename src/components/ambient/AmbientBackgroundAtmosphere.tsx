"use client";

import React from 'react';
import { ActiveAmbientTheme } from '@/contexts/WeatherAmbientContext';

interface AmbientBackgroundAtmosphereProps {
  theme: ActiveAmbientTheme;
}

export default function AmbientBackgroundAtmosphere({
  theme,
}: AmbientBackgroundAtmosphereProps) {
  const isGolden = theme === 'golden-safari';
  const isEmerald = theme === 'rainforest-emerald';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-in-out select-none"
      aria-hidden="true"
    >
      {/* CUACA CERAH: Pendaran Halus Hangat */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isGolden ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute -top-32 -right-32 w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.03) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* CUACA HUJAN/MENDUNG: Pendaran Halus Zamrud Hutan */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isEmerald ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] md:w-[900px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(16, 185, 129, 0.07) 0%, rgba(5, 150, 105, 0.03) 50%, transparent 75%)',
            filter: 'blur(60px)',
          }}
        />
      </div>
    </div>
  );
}
