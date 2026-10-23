 import { useState, useEffect, useCallback, useRef } from 'react';
 import { useGeolocation, calculateDistance, isWithinZoo } from './useGeolocation';
 import { Animal } from './useAnimals';
 
 export interface NearbyAnimal extends Animal {
   distance: number; // in meters
 }
 
 interface ProximityAudioState {
   nearbyAnimals: NearbyAnimal[];
   currentAnimal: NearbyAnimal | null;
   isTracking: boolean;
   isWithinZoo: boolean;
   error: string | null;
 }
 
 interface UseProximityAudioOptions {
   triggerRadius?: number; // in meters, default 30m
   autoPlay?: boolean;
   animals: Animal[];
 }
 
 const DEFAULT_TRIGGER_RADIUS = 30; // 30 meters
 
 export function useProximityAudio(options: UseProximityAudioOptions) {
   const { 
     triggerRadius = DEFAULT_TRIGGER_RADIUS, 
     autoPlay = false,
     animals 
   } = options;
 
   const [state, setState] = useState<ProximityAudioState>({
     nearbyAnimals: [],
     currentAnimal: null,
     isTracking: false,
     isWithinZoo: false,
     error: null,
   });
 
   const lastTriggeredRef = useRef<number | null>(null);
   const onAnimalDetectedRef = useRef<((animal: NearbyAnimal) => void) | null>(null);
 
   const {
     position,
     error: geoError,
     loading: geoLoading,
     isWatching,
     startWatching,
     stopWatching,
   } = useGeolocation({
     enableHighAccuracy: true,
     timeout: 15000,
     maximumAge: 5000,
   });
 
   // Calculate nearby animals when position changes
   useEffect(() => {
     if (!position || !animals.length) return;
 
     const { latitude, longitude } = position;
     const withinZoo = isWithinZoo(latitude, longitude);
 
     // Filter animals with valid coordinates
     const animalsWithCoords = animals.filter(
       (a) => a.latitude != null && a.longitude != null
     );
 
     // Calculate distance to each animal and sort by distance
     const nearby: NearbyAnimal[] = animalsWithCoords
       .map((animal) => ({
         ...animal,
         distance: calculateDistance(
           latitude,
           longitude,
           animal.latitude!,
           animal.longitude!
         ) * 1000, // Convert km to meters
       }))
       .filter((a) => a.distance <= triggerRadius * 3) // Include animals within 3x radius for display
       .sort((a, b) => a.distance - b.distance);
 
     // Find the closest animal within trigger radius
     const closestInRange = nearby.find((a) => a.distance <= triggerRadius);
 
     setState((prev) => ({
       ...prev,
       nearbyAnimals: nearby.slice(0, 5), // Top 5 nearest
       currentAnimal: closestInRange || null,
       isWithinZoo: withinZoo,
       isTracking: isWatching,
     }));
 
     // Trigger callback if new animal detected
     if (
       closestInRange &&
       closestInRange.id !== lastTriggeredRef.current &&
       closestInRange.audio_url &&
       autoPlay
     ) {
       lastTriggeredRef.current = closestInRange.id;
       onAnimalDetectedRef.current?.(closestInRange);
     }
   }, [position, animals, triggerRadius, isWatching, autoPlay]);
 
   // Update error state
   useEffect(() => {
     if (geoError) {
       setState((prev) => ({ ...prev, error: geoError }));
     }
   }, [geoError]);
 
   const startTracking = useCallback(() => {
     setState((prev) => ({ ...prev, error: null }));
     startWatching();
   }, [startWatching]);
 
   const stopTracking = useCallback(() => {
     stopWatching();
     lastTriggeredRef.current = null;
     setState((prev) => ({
       ...prev,
       isTracking: false,
       currentAnimal: null,
     }));
   }, [stopWatching]);
 
   const setOnAnimalDetected = useCallback(
     (callback: (animal: NearbyAnimal) => void) => {
       onAnimalDetectedRef.current = callback;
     },
     []
   );
 
   const clearCurrentAnimal = useCallback(() => {
     lastTriggeredRef.current = null;
     setState((prev) => ({ ...prev, currentAnimal: null }));
   }, []);
 
   return {
     ...state,
     loading: geoLoading,
     startTracking,
     stopTracking,
     setOnAnimalDetected,
     clearCurrentAnimal,
     position,
   };
 }