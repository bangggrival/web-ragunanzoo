"use client";

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function DynamicFavicon() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Priority: settings.favicon_url > settings.logo_url > /api/favicon
    const rawFavicon = settings?.favicon_url || settings?.logo_url;
    const faviconUrl = rawFavicon || '/api/favicon';

    const setOrCreateLink = (rel: string, href: string, type?: string) => {
      let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      if (type) link.type = type;
    };

    // Update standard icon, shortcut icon, and apple-touch-icon
    setOrCreateLink('icon', faviconUrl, 'image/png');
    setOrCreateLink('shortcut icon', faviconUrl, 'image/png');
    setOrCreateLink('apple-touch-icon', faviconUrl);

    // Also update any generic link[rel*="icon"]
    const allIconLinks = document.querySelectorAll("link[rel*='icon']");
    allIconLinks.forEach((el) => {
      (el as HTMLLinkElement).href = faviconUrl;
    });
  }, [settings?.favicon_url, settings?.logo_url]);

  return null;
}
