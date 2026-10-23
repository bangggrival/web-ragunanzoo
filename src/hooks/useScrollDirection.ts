"use client";

import { useState, useEffect } from 'react';

interface ScrollDirectionOptions {
  threshold?: number;
  topOffset?: number;
}

export function useScrollDirection({
  threshold = 12,
  topOffset = 60,
}: ScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      const atTop = scrollY <= topOffset;
      setIsAtTop(atTop);

      // Always visible when near the top of the page
      if (atTop) {
        setIsVisible(true);
        setScrollDirection('up');
        lastScrollY = scrollY <= 0 ? 0 : scrollY;
        ticking = false;
        return;
      }

      const diff = scrollY - lastScrollY;

      if (Math.abs(diff) >= threshold) {
        if (diff > 0) {
          // Scrolling DOWN: User is reading, hide floating distractions
          setScrollDirection('down');
          setIsVisible(false);
        } else {
          // Scrolling UP: User wants navigation, reveal floating controls
          setScrollDirection('up');
          setIsVisible(true);
        }
        lastScrollY = scrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, topOffset]);

  return { scrollDirection, isVisible, isAtTop };
}
