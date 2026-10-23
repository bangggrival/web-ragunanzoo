import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Accessibility, 
  X, 
  Type, 
  Eye, 
  Zap, 
  BookOpen, 
  AlignJustify, 
  MousePointer2, 
  Link2, 
  Volume2,
  RotateCcw,
  Palette,
  SunMoon,
  Space,
  ImageOff,
  Focus,
  Ruler
} from 'lucide-react';
import { useAccessibility, AccessibilitySettings } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFooterInView } from '@/hooks/useFooterInView';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function AccessibilityWidget() {
  const [mounted, setMounted] = useState(false);
  const isFooterVisible = useFooterInView();
  const { isVisible: isScrollVisible } = useScrollDirection();
  const { 
    settings, 
    updateSetting, 
    resetSettings, 
    announce, 
    isMenuOpen, 
    closeMenu, 
    toggleMenu 
  } = useAccessibility();
  const { language } = useLanguage();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when accessibility modal is open
  useEffect(() => {
    if (isMenuOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, closeMenu]);

  const shouldHideFloating = !isMenuOpen && (!isScrollVisible || isFooterVisible);

  const shiftClass = (mounted && shouldHideFloating)
    ? 'opacity-0 scale-90 translate-y-6 pointer-events-none'
    : 'opacity-100 scale-100 translate-y-0';

  const t = {
    title: language === 'en' ? 'Accessibility' : 'Aksesibilitas',
    subtitle: language === 'en' ? 'Adjust viewing and reading comfort' : 'Penyesuaian kenyamanan membaca & tampilan',
    fontSize: language === 'en' ? 'Font Size' : 'Ukuran Font',
    normal: language === 'en' ? 'Normal' : 'Normal',
    large: language === 'en' ? 'Large' : 'Besar',
    xlarge: language === 'en' ? 'Extra Large' : 'Sangat Besar',
    highContrast: language === 'en' ? 'High Contrast' : 'Kontras Tinggi',
    reducedMotion: language === 'en' ? 'Reduced Motion' : 'Kurangi Animasi',
    dyslexiaFont: language === 'en' ? 'Dyslexia-Friendly Font' : 'Font Ramah Disleksia',
    lineHeight: language === 'en' ? 'Line Spacing' : 'Spasi Baris',
    relaxed: language === 'en' ? 'Relaxed' : 'Longgar',
    loose: language === 'en' ? 'Extra Loose' : 'Sangat Longgar',
    cursorSize: language === 'en' ? 'Large Cursor' : 'Kursor Besar',
    highlightLinks: language === 'en' ? 'Highlight Links' : 'Sorot Tautan',
    textToSpeech: language === 'en' ? 'Text to Speech' : 'Baca Teks',
    reset: language === 'en' ? 'Reset All' : 'Reset Semua',
    close: language === 'en' ? 'Close' : 'Tutup',
    openMenu: language === 'en' ? 'Open accessibility menu' : 'Buka menu aksesibilitas',
    saturation: language === 'en' ? 'Color Saturation' : 'Saturasi Warna',
    low: language === 'en' ? 'Low' : 'Rendah',
    grayscale: language === 'en' ? 'Grayscale' : 'Abu-abu',
    invertColors: language === 'en' ? 'Invert Colors' : 'Balik Warna',
    letterSpacing: language === 'en' ? 'Letter Spacing' : 'Spasi Huruf',
    wide: language === 'en' ? 'Wide' : 'Lebar',
    wider: language === 'en' ? 'Wider' : 'Lebih Lebar',
    hideImages: language === 'en' ? 'Hide Images' : 'Sembunyikan Gambar',
    readingGuide: language === 'en' ? 'Reading Guide' : 'Panduan Baca',
    focusMode: language === 'en' ? 'Focus Mode' : 'Mode Fokus',
    visual: language === 'en' ? 'Visual' : 'Visual',
    reading: language === 'en' ? 'Reading' : 'Membaca',
    tools: language === 'en' ? 'Tools' : 'Alat Bantu',
  };

  // Announce when settings change
  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
    label: string
  ) => {
    updateSetting(key, value);
    announce(`${label} ${typeof value === 'boolean' ? (value ? 'diaktifkan' : 'dinonaktifkan') : value}`);
  };

  const handleReset = () => {
    resetSettings();
    announce(language === 'en' ? 'All settings reset to default' : 'Semua pengaturan dikembalikan ke default');
  };

  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Global text-to-speech handler
  useEffect(() => {
    if (settings.textToSpeech) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('#accessibility-menu') || target.closest('[aria-label*="Aksesibilitas"]')) return;
        const text = target.innerText || target.textContent;
        if (text && text.trim()) {
          speakText(text.trim());
        }
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [settings.textToSpeech, speakText]);

  return (
    <>
      {/* Desktop Floating Trigger Button (Bottom Left) */}
      <div 
        suppressHydrationWarning 
        className={`fixed left-4 md:left-6 bottom-6 z-30 transition-all duration-300 ease-out ${shiftClass}`}
      >
        <button
          ref={triggerRef}
          onClick={toggleMenu}
          aria-label={t.openMenu}
          aria-expanded={isMenuOpen}
          aria-controls="accessibility-menu"
          className="hidden md:flex w-14 h-14 bg-primary text-white rounded-full shadow-lg md:shadow-xl items-center justify-center hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-200 active:scale-95 hover:scale-105"
        >
          <Accessibility className="w-7 h-7" />
        </button>
      </div>

      {/* Accessible Modal Portal (Works reliably across Desktop & Mobile) */}
      {mounted && isMenuOpen && createPortal(
        <div
          className="fixed inset-0 z-[120] flex flex-col justify-end md:justify-center items-center pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-title"
        >
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            id="accessibility-menu"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full md:max-w-[480px] max-h-[88dvh] md:max-h-[82vh] bg-card dark:bg-[#0A120E] text-card-foreground border-t md:border border-border/80 rounded-t-[28px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-6 md:zoom-in-95 duration-250 ease-out"
          >
            {/* Mobile Drag Indicator */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3.5 sm:px-5 flex items-center justify-between flex-shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Accessibility className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 id="a11y-title" className="font-bold text-base sm:text-lg leading-tight text-white">{t.title}</h2>
                  <p className="text-[11px] text-white/80 leading-tight">{t.subtitle}</p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                aria-label={t.close}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Settings Panel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 overscroll-contain">
              {/* === READING SECTION === */}
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t.reading}
                </p>
                
                {/* Font Size */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Type className="w-4 h-4 text-primary" />
                    {t.fontSize}
                  </label>
                  <div className="flex gap-2">
                    {(['normal', 'large', 'xlarge'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSettingChange('fontSize', size, t.fontSize)}
                        aria-pressed={settings.fontSize === size}
                        className={`flex-1 py-2 px-3 text-xs rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          settings.fontSize === size
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {size === 'normal' ? t.normal : size === 'large' ? t.large : t.xlarge}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlignJustify className="w-4 h-4 text-primary" />
                    {t.lineHeight}
                  </label>
                  <div className="flex gap-2">
                    {(['normal', 'relaxed', 'loose'] as const).map((height) => (
                      <button
                        key={height}
                        onClick={() => handleSettingChange('lineHeight', height, t.lineHeight)}
                        aria-pressed={settings.lineHeight === height}
                        className={`flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          settings.lineHeight === height
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {height === 'normal' ? t.normal : height === 'relaxed' ? t.relaxed : t.loose}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Space className="w-4 h-4 text-primary" />
                    {t.letterSpacing}
                  </label>
                  <div className="flex gap-2">
                    {(['normal', 'wide', 'wider'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        onClick={() => handleSettingChange('letterSpacing', spacing, t.letterSpacing)}
                        aria-pressed={settings.letterSpacing === spacing}
                        className={`flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          settings.letterSpacing === spacing
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {spacing === 'normal' ? t.normal : spacing === 'wide' ? t.wide : t.wider}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* === VISUAL SECTION === */}
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t.visual}
                </p>

                {/* Saturation */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Palette className="w-4 h-4 text-primary" />
                    {t.saturation}
                  </label>
                  <div className="flex gap-2">
                    {(['normal', 'low', 'grayscale'] as const).map((sat) => (
                      <button
                        key={sat}
                        onClick={() => handleSettingChange('saturation', sat, t.saturation)}
                        aria-pressed={settings.saturation === sat}
                        className={`flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          settings.saturation === sat
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {sat === 'normal' ? t.normal : sat === 'low' ? t.low : t.grayscale}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Toggles */}
                <div className="space-y-2">
                  <ToggleOption
                    icon={Eye}
                    label={t.highContrast}
                    checked={settings.highContrast}
                    onChange={(v) => handleSettingChange('highContrast', v, t.highContrast)}
                  />
                  <ToggleOption
                    icon={SunMoon}
                    label={t.invertColors}
                    checked={settings.invertColors}
                    onChange={(v) => handleSettingChange('invertColors', v, t.invertColors)}
                  />
                  <ToggleOption
                    icon={ImageOff}
                    label={t.hideImages}
                    checked={settings.hideImages}
                    onChange={(v) => handleSettingChange('hideImages', v, t.hideImages)}
                  />
                </div>
              </div>

              {/* === TOOLS SECTION === */}
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t.tools}
                </p>

                <div className="space-y-2">
                  <ToggleOption
                    icon={Zap}
                    label={t.reducedMotion}
                    checked={settings.reducedMotion}
                    onChange={(v) => handleSettingChange('reducedMotion', v, t.reducedMotion)}
                  />
                  <ToggleOption
                    icon={BookOpen}
                    label={t.dyslexiaFont}
                    checked={settings.dyslexiaFont}
                    onChange={(v) => handleSettingChange('dyslexiaFont', v, t.dyslexiaFont)}
                  />
                  <ToggleOption
                    icon={MousePointer2}
                    label={t.cursorSize}
                    checked={settings.cursorSize === 'large'}
                    onChange={(v) => handleSettingChange('cursorSize', v ? 'large' : 'normal', t.cursorSize)}
                  />
                  <ToggleOption
                    icon={Link2}
                    label={t.highlightLinks}
                    checked={settings.highlightLinks}
                    onChange={(v) => handleSettingChange('highlightLinks', v, t.highlightLinks)}
                  />
                  <ToggleOption
                    icon={Volume2}
                    label={t.textToSpeech}
                    checked={settings.textToSpeech}
                    onChange={(v) => handleSettingChange('textToSpeech', v, t.textToSpeech)}
                  />
                  <ToggleOption
                    icon={Ruler}
                    label={t.readingGuide}
                    checked={settings.readingGuide}
                    onChange={(v) => handleSettingChange('readingGuide', v, t.readingGuide)}
                  />
                  <ToggleOption
                    icon={Focus}
                    label={t.focusMode}
                    checked={settings.focusMode}
                    onChange={(v) => handleSettingChange('focusMode', v, t.focusMode)}
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border/60 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 bg-destructive/10 border border-destructive/20 rounded-xl text-xs sm:text-sm font-semibold text-destructive hover:bg-destructive/20 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                {t.reset}
              </button>
              <button
                onClick={closeMenu}
                className="py-2.5 px-5 bg-primary text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary/90 flex items-center justify-center transition-colors shadow-sm active:scale-98"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Toggle Option Component
function ToggleOption({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
        checked ? 'bg-primary/10 border border-primary/40' : 'bg-muted/70 hover:bg-muted border border-transparent'
      }`}
    >
      <span className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
        <Icon className={`w-4 h-4 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
        {label}
      </span>
      <div
        className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}
