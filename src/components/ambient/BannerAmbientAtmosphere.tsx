"use client";

import React from 'react';
import { ActiveAmbientTheme } from '@/contexts/WeatherAmbientContext';
import RainCanvas from './RainCanvas';

interface BannerAmbientAtmosphereProps {
  theme: ActiveAmbientTheme;
  className?: string;
}

export default function BannerAmbientAtmosphere({
  theme,
  className = '',
}: BannerAmbientAtmosphereProps) {
  const isGolden = theme === 'golden-safari';
  const isEmerald = theme === 'rainforest-emerald';

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 overflow-hidden select-none transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================== */}
      {/* CUACA CERAH: Pendaran Alami Golden Safari Sunlight       */}
      {/* ======================================================== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isGolden ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Soft natural golden sunlight glow from top-right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 85% 15%, rgba(251, 191, 36, 0.16) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 75%)',
          }}
        />

        {/* Gentle warm ambient lighting across bottom transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-amber-500/10 via-amber-500/5 to-transparent" />
      </div>

      {/* ======================================================== */}
      {/* CUACA HUJAN/MENDUNG: Rainforest Emerald Mist & Rintik Air */}
      {/* ======================================================== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isEmerald ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Cool, natural rainforest emerald mist wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(16, 185, 129, 0.14) 0%, rgba(6, 78, 59, 0.18) 50%, transparent 80%)',
          }}
        />

        {/* Delicate, realistic rain droplets canvas */}
        <RainCanvas intensity="light" speed={0.9} />

        {/* Soft cool mist edge at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-950/30 via-emerald-900/10 to-transparent" />
      </div>
    </div>
  );
}
