import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (/ipad|tablet/i.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  return 'desktop';
};

// Get browser name
const getBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Other';
};

export function usePageTracking() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const trackPageView = async () => {
      // Avoid double-tracking the same page
      if (!pathname || lastTrackedPath.current === pathname) return;
      lastTrackedPath.current = pathname;

      // Don't track manager pages to avoid noise
      if (pathname.startsWith('/manager')) return;

      try {
        const sessionId = getSessionId();
        const deviceType = getDeviceType();
        const browser = getBrowser();
        
        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('page_views').insert({
          page_path: pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: sessionId,
          user_id: user?.id || null,
          device_type: deviceType,
          browser: browser,
        });
      } catch (error) {
        // Silently fail - don't break the app for analytics
        console.debug('Analytics tracking error:', error);
      }
    };

    // Small delay to ensure page has loaded
    const timeoutId = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeoutId);
  }, [pathname]);
}
