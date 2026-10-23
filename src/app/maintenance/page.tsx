'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MaintenanceData {
  enabled: boolean;
  title: string;
  subtitle: string;
  estimated_done: string | null;
  background_image_url: string | null;
  contact_phone: string;
  contact_email: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
          <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function GearIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [dots, setDots] = useState('');

  // Fetch maintenance config & logo
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/maintenance-status', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.data) setData(json.data);
        }
      } catch {
        // Use fallback defaults
      }

      try {
        const settingsRes = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'site_settings',
            action: 'select',
            selects: 'logo_url,site_name',
            filters: [{ type: 'eq', column: 'id', value: 'main' }],
            single: true,
          }),
        });
        if (settingsRes.ok) {
          const settingsJson = await settingsRes.json();
          if (settingsJson.data?.logo_url) setLogoUrl(settingsJson.data.logo_url);
        }
      } catch {
        // No logo
      }
    }
    load();
    document.title = 'Pemeliharaan Sistem - Taman Margasatwa Ragunan';
  }, []);

  // Countdown
  useEffect(() => {
    if (!data?.estimated_done) return;
    setTimeLeft(calculateTimeLeft(data.estimated_done));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(data.estimated_done!));
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.estimated_done]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const title = data?.title || 'Sedang dalam Pemeliharaan';
  const subtitle =
    data?.subtitle ||
    'Kami sedang melakukan pembaruan sistem untuk meningkatkan layanan Anda. Mohon maaf atas ketidaknyamanan ini.';
  const contactPhone = data?.contact_phone || '(021) 7884-0233';
  const contactEmail = data?.contact_email || 'taman.margasatwa@jakarta.go.id';
  const bgImage = data?.background_image_url;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; background: #0a1a0f; }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(10deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-8deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gear-main { animation: spin-slow 8s linear infinite; }
        .gear-small { animation: spin-reverse 5s linear infinite; }
        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float2 8s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .fade-in-up { animation: fadeInUp 0.8s ease-out both; }
        .fade-in-up-1 { animation: fadeInUp 0.8s ease-out 0.1s both; }
        .fade-in-up-2 { animation: fadeInUp 0.8s ease-out 0.2s both; }
        .fade-in-up-3 { animation: fadeInUp 0.8s ease-out 0.3s both; }
        .fade-in-up-4 { animation: fadeInUp 0.8s ease-out 0.4s both; }
        .shimmer-text {
          background: linear-gradient(90deg, #4ade80, #86efac, #4ade80);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '2rem 1rem',
        }}
      >
        {/* Background */}
        {bgImage ? (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.25)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(5,46,22,0.85) 0%, rgba(0,0,0,0.75) 100%)',
                zIndex: 1,
              }}
            />
          </>
        ) : (
          <>
            {/* Default gradient bg */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background:
                  'radial-gradient(ellipse at 20% 20%, #052e16 0%, #0a1a0f 50%, #000000 100%)',
                zIndex: 0,
              }}
            />
            {/* Decorative blobs */}
            <div
              className="pulse-glow"
              style={{
                position: 'fixed',
                top: '-10%',
                left: '-10%',
                width: '50vw',
                height: '50vw',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
            <div
              className="pulse-glow"
              style={{
                position: 'fixed',
                bottom: '-15%',
                right: '-10%',
                width: '60vw',
                height: '60vw',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(21,128,61,0.10) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none',
                animationDelay: '1.5s',
              }}
            />
            {/* Decorative floating leaves */}
            <div
              className="float-1"
              style={{
                position: 'fixed',
                top: '12%',
                right: '8%',
                fontSize: '4rem',
                opacity: 0.12,
                zIndex: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🌿
            </div>
            <div
              className="float-2"
              style={{
                position: 'fixed',
                bottom: '15%',
                left: '6%',
                fontSize: '3rem',
                opacity: 0.10,
                zIndex: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              🦁
            </div>
          </>
        )}

        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '680px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '2rem',
          }}
        >
          {/* Logo + Brand */}
          <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '2.5rem' }}>🦁</span>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(134,239,172,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Taman Margasatwa Ragunan
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
                Dinas Kehutanan — Pemprov DKI Jakarta
              </div>
            </div>
          </div>

          {/* Gear animation */}
          <div className="fade-in-up-1" style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GearIcon
              className="gear-main"
              style={{
                width: '80px',
                height: '80px',
                color: 'rgba(74,222,128,0.7)',
                position: 'absolute',
              } as React.CSSProperties}
            />
            <GearIcon
              className="gear-small"
              style={{
                width: '36px',
                height: '36px',
                color: 'rgba(134,239,172,0.5)',
                position: 'absolute',
                top: '2px',
                right: '0px',
              } as React.CSSProperties}
            />
            {/* Center dot */}
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 20px rgba(74,222,128,0.8)',
                zIndex: 1,
              }}
            />
          </div>

          {/* Title */}
          <div className="fade-in-up-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1
              className="shimmer-text"
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.75rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                lineHeight: 1.7,
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              {subtitle}
            </p>

            {/* Animated loading indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.25rem' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    opacity: 0.4 + i * 0.2,
                    animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginLeft: '4px' }}>
                Memproses pembaruan{dots}
              </span>
            </div>
          </div>

          {/* Countdown */}
          {data?.estimated_done && (
            <div className="fade-in-up-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1.5rem',
                  padding: '1.5rem 2rem',
                  width: '100%',
                }}
              >
                <p style={{ color: 'rgba(134,239,172,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>
                  Estimasi Selesai
                </p>
                {timeLeft ? (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <CountdownUnit value={timeLeft.days} label="Hari" />
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '2rem', fontWeight: 900, alignSelf: 'flex-start', marginTop: '12px' }}>:</div>
                    <CountdownUnit value={timeLeft.hours} label="Jam" />
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '2rem', fontWeight: 900, alignSelf: 'flex-start', marginTop: '12px' }}>:</div>
                    <CountdownUnit value={timeLeft.minutes} label="Menit" />
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '2rem', fontWeight: 900, alignSelf: 'flex-start', marginTop: '12px' }}>:</div>
                    <CountdownUnit value={timeLeft.seconds} label="Detik" />
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>Segera hadir…</p>
                )}
              </div>
            </div>
          )}

          {/* Contact info */}
          <div
            className="fade-in-up-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem',
              padding: '1.25rem 1.5rem',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
              Butuh bantuan? Hubungi kami
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={`tel:${contactPhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(134,239,172,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4ade80')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(134,239,172,0.8)')}
              >
                <span>📞</span> {contactPhone}
              </a>
              <a
                href={`mailto:${contactEmail}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(134,239,172,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4ade80')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(134,239,172,0.8)')}
              >
                <span>✉️</span> {contactEmail}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.6 }}>
            &copy; {new Date().getFullYear()} Taman Margasatwa Ragunan &bull; Dinas Kehutanan Pemerintah Provinsi DKI Jakarta
          </div>
        </div>
      </div>
    </>
  );
}
