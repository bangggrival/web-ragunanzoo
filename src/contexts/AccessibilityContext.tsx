import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  lineHeight: 'normal' | 'relaxed' | 'loose';
  cursorSize: 'normal' | 'large';
  highlightLinks: boolean;
  textToSpeech: boolean;
  // New features
  saturation: 'normal' | 'low' | 'grayscale';
  invertColors: boolean;
  letterSpacing: 'normal' | 'wide' | 'wider';
  hideImages: boolean;
  readingGuide: boolean;
  focusMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  lineHeight: 'normal',
  cursorSize: 'normal',
  highlightLinks: false,
  textToSpeech: false,
  // New features defaults
  saturation: 'normal',
  invertColors: false,
  letterSpacing: 'normal',
  hideImages: false,
  readingGuide: false,
  focusMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'accessibility-settings';

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  // Listen for global custom events
  useEffect(() => {
    const handleOpen = () => setIsMenuOpen(true);
    const handleToggle = () => setIsMenuOpen(prev => !prev);
    const handleClose = () => setIsMenuOpen(false);

    window.addEventListener('open-accessibility-menu', handleOpen);
    window.addEventListener('toggle-accessibility-menu', handleToggle);
    window.addEventListener('close-accessibility-menu', handleClose);

    return () => {
      window.removeEventListener('open-accessibility-menu', handleOpen);
      window.removeEventListener('toggle-accessibility-menu', handleToggle);
      window.removeEventListener('close-accessibility-menu', handleClose);
    };
  }, []);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {
      console.error('Failed to load accessibility settings:', e);
    }
    setMounted(true);
  }, []);

  // Apply settings to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    // Font size
    root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge');
    root.classList.add(`a11y-font-${settings.fontSize}`);

    // High contrast
    root.classList.toggle('a11y-high-contrast', settings.highContrast);

    // Reduced motion
    root.classList.toggle('a11y-reduced-motion', settings.reducedMotion);

    // Dyslexia font
    root.classList.toggle('a11y-dyslexia-font', settings.dyslexiaFont);

    // Line height
    root.classList.remove('a11y-line-normal', 'a11y-line-relaxed', 'a11y-line-loose');
    root.classList.add(`a11y-line-${settings.lineHeight}`);

    // Cursor size
    root.classList.toggle('a11y-cursor-large', settings.cursorSize === 'large');

    // Highlight links
    root.classList.toggle('a11y-highlight-links', settings.highlightLinks);

    // Saturation
    root.classList.remove('a11y-saturation-normal', 'a11y-saturation-low', 'a11y-saturation-grayscale');
    root.classList.add(`a11y-saturation-${settings.saturation}`);

    // Invert colors
    root.classList.toggle('a11y-invert-colors', settings.invertColors);

    // Letter spacing
    root.classList.remove('a11y-letter-normal', 'a11y-letter-wide', 'a11y-letter-wider');
    root.classList.add(`a11y-letter-${settings.letterSpacing}`);

    // Hide images
    root.classList.toggle('a11y-hide-images', settings.hideImages);

    // Reading guide
    root.classList.toggle('a11y-reading-guide', settings.readingGuide);

    // Focus mode
    root.classList.toggle('a11y-focus-mode', settings.focusMode);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save accessibility settings:', e);
    }
  }, [settings, mounted]);

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings(prev => prev.reducedMotion ? prev : { ...prev, reducedMotion: true });
    }
  }, []);

  // Reading guide mouse follower
  useEffect(() => {
    if (settings.readingGuide) {
      const guide = document.createElement('div');
      guide.id = 'a11y-reading-guide';
      guide.className = 'fixed left-0 right-0 h-12 pointer-events-none z-[9999] border-t-2 border-b-2 border-primary/50 bg-primary/5';
      document.body.appendChild(guide);

      const moveGuide = (e: MouseEvent) => {
        guide.style.top = `${e.clientY - 24}px`;
      };

      document.addEventListener('mousemove', moveGuide);
      return () => {
        document.removeEventListener('mousemove', moveGuide);
        guide.remove();
      };
    }
  }, [settings.readingGuide]);

  // Text-To-Speech Screen Reader
  useEffect(() => {
    if (!settings.textToSpeech || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      window.speechSynthesis?.cancel();
      document.querySelectorAll('.a11y-speaking').forEach(el => el.classList.remove('a11y-speaking'));
      return;
    }

    let currentTarget: HTMLElement | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const speakText = (text: string, element: HTMLElement) => {
      window.speechSynthesis.cancel();
      
      if (currentTarget) {
        currentTarget.classList.remove('a11y-speaking');
      }
      
      currentTarget = element;
      currentTarget.classList.add('a11y-speaking');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Force Indonesian by default
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        if (currentTarget) {
          currentTarget.classList.remove('a11y-speaking');
          currentTarget = null;
        }
      };
      
      window.speechSynthesis.speak(utterance);
    };

    const handleInteraction = (e: MouseEvent | FocusEvent) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const target = e.target as HTMLElement;
        if (!target || !target.closest) return;

        // Skip the accessibility widget itself to avoid annoying loops when turning it off
        if (target.closest('#accessibility-menu') || target.closest('[aria-label="Aksesibilitas"]')) return;

        const readableEl = target.closest('h1, h2, h3, h4, h5, h6, p, a, button, input, label, img, li, [role="button"], [role="link"], [aria-label]') as HTMLElement;
        if (!readableEl) return;

        // Prevent repeatedly speaking the exact same element if hovering within its children
        if (readableEl === currentTarget) return;

        let textToRead = '';

        if (readableEl.tagName === 'IMG') {
          textToRead = (readableEl as HTMLImageElement).alt || 'Gambar';
        } else if (readableEl.tagName === 'INPUT') {
          const input = readableEl as HTMLInputElement;
          textToRead = input.value || input.placeholder || input.ariaLabel || 'Kolom input';
        } else {
          textToRead = readableEl.getAttribute('aria-label') || readableEl.innerText || '';
        }

        textToRead = textToRead.trim();
        // Don't read overly long containers (like the whole body)
        if (textToRead && textToRead.length < 500) {
          speakText(textToRead, readableEl);
        }
      }, 300); // 300ms delay avoids speaking while user is quickly moving mouse
    };

    const handleMouseLeave = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    document.addEventListener('mouseover', handleInteraction);
    document.addEventListener('focus', handleInteraction, true);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('mouseover', handleInteraction);
      document.removeEventListener('focus', handleInteraction, true);
      document.removeEventListener('mouseout', handleMouseLeave);
      window.speechSynthesis.cancel();
      if (currentTarget) currentTarget.classList.remove('a11y-speaking');
    };
  }, [settings.textToSpeech]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Screen reader announcement
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById(`a11y-announcer-${priority}`);
    if (announcer) {
      announcer.textContent = '';
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      announce,
      isMenuOpen,
      setIsMenuOpen,
      openMenu,
      closeMenu,
      toggleMenu
    }}>
      {/* Screen reader announcer elements */}
      <div
        id="a11y-announcer-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id="a11y-announcer-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
