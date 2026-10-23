import { useState, useEffect, useCallback } from 'react';

export interface UserPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationState {
  position: UserPosition | null;
  error: string | null;
  loading: boolean;
  isWatching: boolean;
  isSupported: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export function useGeolocation(options: UseGeolocationOptions = defaultOptions) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
    isWatching: false,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const handleSuccess = useCallback((geoPosition: GeolocationPosition) => {
    setState(prev => ({
      ...prev,
      position: {
        latitude: geoPosition.coords.latitude,
        longitude: geoPosition.coords.longitude,
        accuracy: geoPosition.coords.accuracy,
        timestamp: geoPosition.timestamp,
      },
      loading: false,
      error: null,
    }));
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Gagal mendapatkan lokasi';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Akses lokasi ditolak. Mohon izinkan akses lokasi di pengaturan browser.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Informasi lokasi tidak tersedia.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Waktu permintaan lokasi habis. Coba lagi.';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation tidak didukung di browser ini.',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      }
    );
  }, [state.isSupported, options, handleSuccess, handleError]);

  const startWatching = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation tidak didukung di browser ini.',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, isWatching: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      }
    );

    setWatchId(id);
  }, [state.isSupported, options, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setState(prev => ({ ...prev, isWatching: false }));
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
  };
}

// Ragunan Zoo approximate bounds (for converting GPS to map percentage)
// These are approximate coordinates for Taman Margasatwa Ragunan
export const RAGUNAN_BOUNDS = {
  north: -6.2920,  // Top of the zoo
  south: -6.3080,  // Bottom of the zoo  
  east: 106.8330,  // Right side
  west: 106.8150,  // Left side
};

// Convert GPS coordinates to map percentage position
export function gpsToMapPosition(latitude: number, longitude: number): { x: number; y: number } | null {
  const { north, south, east, west } = RAGUNAN_BOUNDS;
  
  // Check if the position is within Ragunan bounds
  if (latitude > north || latitude < south || longitude > east || longitude < west) {
    return null; // User is outside the zoo
  }
  
  // Convert to percentage (0-100)
  const x = ((longitude - west) / (east - west)) * 100;
  const y = ((north - latitude) / (north - south)) * 100;
  
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

// Check if user is within zoo area
export function isWithinZoo(latitude: number, longitude: number): boolean {
  const { north, south, east, west } = RAGUNAN_BOUNDS;
  return latitude <= north && latitude >= south && longitude <= east && longitude >= west;
}

// Utility function to calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate walking time in minutes (average walking speed: 5 km/h)
export function estimateWalkingTime(distanceKm: number): number {
  return Math.round((distanceKm / 5) * 60);
}
