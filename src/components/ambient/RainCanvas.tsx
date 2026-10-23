"use client";

import React, { useEffect, useRef } from 'react';

interface RainCanvasProps {
  intensity?: 'light' | 'moderate' | 'dense';
  className?: string;
  speed?: number;
}

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export default function RainCanvas({
  intensity = 'light',
  className = '',
  speed = 0.9,
}: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };

    window.addEventListener('resize', handleResize);

    // Subtle drop count for elegant, fine drizzle
    const dropCount = intensity === 'dense' ? 65 : 42;
    const drops: Drop[] = [];
    const splashes: Splash[] = [];
    const windAngle = -0.12;

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (width + 60) - 30,
        y: Math.random() * height,
        length: Math.random() * 12 + 8,
        speed: (Math.random() * 4 + 6) * speed,
        opacity: Math.random() * 0.25 + 0.12,
        width: 0.65,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render subtle rain streaks
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        const gradient = ctx.createLinearGradient(d.x, d.y, d.x + d.length * windAngle, d.y + d.length);
        gradient.addColorStop(0, `rgba(220, 245, 240, 0)`);
        gradient.addColorStop(0.7, `rgba(220, 250, 245, ${d.opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(240, 255, 250, ${d.opacity})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.length * windAngle, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x += d.speed * windAngle;

        // Subtle splash ripple at bottom area
        if (d.y >= height - Math.random() * 60) {
          if (splashes.length < 15 && Math.random() > 0.6) {
            splashes.push({
              x: d.x,
              y: d.y,
              radius: 1,
              maxRadius: Math.random() * 5 + 3,
              opacity: 0.4,
            });
          }
          d.y = -d.length - Math.random() * 15;
          d.x = Math.random() * (width + 60) - 30;
        }
      }

      // Render delicate splash rings
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.strokeStyle = `rgba(200, 245, 235, ${s.opacity})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.radius * 1.8, s.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();

        s.radius += 0.35;
        s.opacity -= 0.035;

        if (s.opacity <= 0 || s.radius >= s.maxRadius) {
          splashes.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-10 w-full h-full mix-blend-screen transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    />
  );
}
