import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

export function useFavicon() {
  const { settings } = useSiteSettings();
  const { language } = useLanguage();
  const pathname = usePathname();
  
  useEffect(() => {
    // Update favicon from database — replace ALL icon link elements to avoid stale cache
    const faviconUrl = settings?.favicon_url || settings?.loading_logo_url || '/favicon.png';
    if (!faviconUrl) return;

    // Add cache-buster using updated_at timestamp so browser re-fetches on change
    const ts = settings?.updated_at ? new Date(settings.updated_at).getTime() : Date.now();
    const faviconWithTs = `${faviconUrl}?v=${ts}`;

    // Selectors to update: standard icon + apple-touch-icon
    const selectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
      "link[rel='apple-touch-icon-precomposed']",
      "link[rel*='icon']",
    ];

    const seen = new Set<Element>();
    selectors.forEach((selector) => {
      document.querySelectorAll<HTMLLinkElement>(selector).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          el.href = faviconWithTs;
          el.type = faviconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/png';
        }
      });
    });

    // If no icon link exists yet, create one
    if (seen.size === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = faviconWithTs;
      document.head.appendChild(link);
    }
  }, [settings?.favicon_url, settings?.loading_logo_url, settings?.updated_at]);

  useEffect(() => {
    const updateTitle = () => {
      if (typeof document === 'undefined') return;
      
      const currentTitle = document.title;
      let newTitle = currentTitle;
      
      const defaultEn = 'Ragunan Zoo';
      const defaultId = 'Taman Margasatwa Ragunan';
      
      const desiredName = settings?.site_name && settings.site_name !== defaultEn && settings.site_name !== defaultId 
        ? settings.site_name 
        : (language === 'id' ? defaultId : defaultEn);

      // Force replace any occurrence of the default names with the desired name
      if (desiredName !== defaultEn) {
        newTitle = newTitle.replace(new RegExp(defaultEn, 'g'), desiredName);
      }
      if (desiredName !== defaultId) {
        newTitle = newTitle.replace(new RegExp(defaultId, 'g'), desiredName);
      }

      if (newTitle !== currentTitle) {
        document.title = newTitle;
      }
    };

    // Run immediately
    updateTitle();

    // Next.js App Router dynamically replaces <title> during navigation and hot-reloads.
    // A MutationObserver on <head> sometimes misses React 18's title hydration, 
    // so we use a lightweight interval to guarantee the title stays correct.
    const interval = setInterval(updateTitle, 500);

    return () => {
      clearInterval(interval);
    };
  }, [settings?.site_name, language, pathname]);
}
