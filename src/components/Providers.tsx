"use client";

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFavicon } from "@/hooks/useFavicon";
import { AuthProvider } from "@/hooks/useAuth";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale so it refreshes immediately from database
      gcTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Component to handle favicon and title from database
const FaviconHandler = () => {
  useFavicon();
  return null;
};

// Component to handle realtime database invalidation in React Query
const RealtimeHandler = () => {
  useEffect(() => {
    const handleDbChange = (e: any) => {
      const table = e.detail?.table;
      console.log(`[REALTIME] Invalidating queries for table: ${table}`);
      if (table) {
        queryClient.invalidateQueries({ queryKey: [table] });
      }
      queryClient.invalidateQueries();
    };

    window.addEventListener('supabase-db-change', handleDbChange);
    return () => {
      window.removeEventListener('supabase-db-change', handleDbChange);
    };
  }, []);

  return null;
};

import ErrorBoundary from "@/components/ui/ErrorBoundary";

import { WeatherAmbientProvider } from "@/contexts/WeatherAmbientContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <WeatherAmbientProvider>
          <QueryClientProvider client={queryClient}>
            <RealtimeHandler />
            <FaviconHandler />
            <AuthProvider>
              <AccessibilityProvider>
                <TooltipProvider>
                  {children}
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </AccessibilityProvider>
            </AuthProvider>
          </QueryClientProvider>
        </WeatherAmbientProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
