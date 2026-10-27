"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAnimals } from '@/hooks/useAnimals';
import { useProximityAudio, NearbyAnimal } from '@/hooks/useProximityAudio';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import AnimalAudioPlayer from '@/components/audio/AnimalAudioPlayer';
import { cn } from '@/lib/utils';

export default function AudioGuide() {
  const { language } = useLanguage();
  const { animals, loading: animalsLoading } = useAnimals();
  const { audioEnabled, loading: flagsLoading } = useFeatureFlags();
  const [autoPlay, setAutoPlay] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
   const [selectedAnimal, setSelectedAnimal] = useState<NearbyAnimal | null>(null);
   const [triggerRadius, setTriggerRadius] = useState(30);
 
   const {
     nearbyAnimals,
     currentAnimal,
     isTracking,
     isWithinZoo,
     error,
     loading,
     startTracking,
     stopTracking,
     setOnAnimalDetected,
     clearCurrentAnimal,
     position,
   } = useProximityAudio({
     animals,
     triggerRadius,
     autoPlay,
   });
 
   // Handle auto-play when animal detected
   useEffect(() => {
     setOnAnimalDetected((animal) => {
       if (animal.audio_url && autoPlay) {
         setSelectedAnimal(animal);
         setShowPlayer(true);
       }
     });
   }, [setOnAnimalDetected, autoPlay]);
 
   const handlePlayAnimal = useCallback((animal: NearbyAnimal) => {
     if (animal.audio_url) {
       setSelectedAnimal(animal);
       setShowPlayer(true);
     }
   }, []);
 
   const handleClosePlayer = useCallback(() => {
     setShowPlayer(false);
     setSelectedAnimal(null);
     clearCurrentAnimal();
   }, [clearCurrentAnimal]);
 
   const toggleTracking = () => {
     if (isTracking) {
       stopTracking();
     } else {
       startTracking();
     }
   };
 
   const getDistanceText = (meters: number) => {
     if (meters < 1000) {
       return `${Math.round(meters)}m`;
     }
     return `${(meters / 1000).toFixed(1)}km`;
   };
 
   const t = {
     title: language === 'en' ? 'Audio Guide' : 'Panduan Audio',
     subtitle: language === 'en' 
       ? 'Listen to animal sounds as you explore the zoo' 
       : 'Dengarkan suara satwa saat menjelajahi kebun binatang',
     startTracking: language === 'en' ? 'Start Tracking' : 'Mulai Pelacakan',
     stopTracking: language === 'en' ? 'Stop Tracking' : 'Hentikan Pelacakan',
     autoPlayLabel: language === 'en' ? 'Auto-play when near animal' : 'Putar otomatis saat dekat satwa',
     nearbyAnimals: language === 'en' ? 'Nearby Animals' : 'Satwa Terdekat',
     noNearby: language === 'en' ? 'No animals detected nearby' : 'Tidak ada satwa terdeteksi di sekitar',
     outsideZoo: language === 'en' 
       ? 'You are outside the zoo area. Please enter the zoo to use this feature.' 
       : 'Anda berada di luar area kebun binatang. Silakan masuk ke kebun binatang untuk menggunakan fitur ini.',
     trackingActive: language === 'en' ? 'Tracking Active' : 'Pelacakan Aktif',
     trackingInactive: language === 'en' ? 'Tracking Inactive' : 'Pelacakan Tidak Aktif',
     listenNow: language === 'en' ? 'Listen' : 'Dengar',
     noAudio: language === 'en' ? 'No audio' : 'Tanpa audio',
     howToUse: language === 'en' ? 'How to Use' : 'Cara Menggunakan',
     step1: language === 'en' 
       ? 'Enable location tracking by tapping the button below' 
       : 'Aktifkan pelacakan lokasi dengan mengetuk tombol di bawah',
     step2: language === 'en' 
       ? 'Walk around the zoo and approach animal enclosures' 
       : 'Berjalan-jalanlah di kebun binatang dan dekati kandang satwa',
     step3: language === 'en' 
       ? 'Audio will play automatically when you\'re near an animal (if enabled)' 
       : 'Audio akan diputar otomatis saat Anda dekat satwa (jika diaktifkan)',
     sensitivity: language === 'en' ? 'Detection Range' : 'Jarak Deteksi',
   };
 
    if (animalsLoading || flagsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <AppIcon icon="Loader2" className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!audioEnabled) {
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-card border shadow-sm space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <AppIcon icon="ShieldAlert" className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Fitur Suara Satwa & Audio Guide Nonaktif</h2>
            <p className="text-sm text-muted-foreground">
              Modul pemutar suara satwa dan panduan audio berbasis lokasi saat ini sedang dinonaktifkan oleh administrator sistem.
            </p>
            <div className="pt-2">
              <Link href="/fauna" className="btn-explorer-primary inline-flex items-center justify-center px-6 py-2.5">
                Kembali ke Jelajah Satwa
              </Link>
            </div>
          </div>
        </div>
      );
    }
 
   return (
     <div className="min-h-screen bg-background pb-24">
       {/* Header */}
       <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl">
         <div className="flex items-center gap-3 mb-2">
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
             <AppIcon icon="Headphones" className="w-6 h-6" />
           </div>
           <div>
             <h1 className="text-2xl font-bold">{t.title}</h1>
             <p className="text-sm opacity-90">{t.subtitle}</p>
           </div>
         </div>
       </div>
 
       <div className="p-4 space-y-4">
         {/* Status Card */}
         <Card className={cn(
           "border-2 transition-colors",
           isTracking ? "border-primary bg-primary/5" : "border-muted"
         )}>
           <CardContent className="p-4">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className={cn(
                   "w-3 h-3 rounded-full",
                  isTracking ? "bg-primary animate-pulse" : "bg-muted-foreground"
                 )} />
                 <span className="font-medium">
                   {isTracking ? t.trackingActive : t.trackingInactive}
                 </span>
               </div>
               {position && (
                 <Badge variant={isWithinZoo ? "default" : "secondary"}>
                   <AppIcon icon="MapPin" className="w-3 h-3 mr-1" />
                   {isWithinZoo 
                     ? (language === 'en' ? 'Inside Zoo' : 'Dalam Kebun Binatang')
                     : (language === 'en' ? 'Outside Zoo' : 'Luar Kebun Binatang')
                   }
                 </Badge>
               )}
             </div>
 
             <Button
               onClick={toggleTracking}
               className="w-full"
               variant={isTracking ? "destructive" : "default"}
               disabled={loading}
             >
               {loading ? (
                 <AppIcon icon="Loader2" className="w-4 h-4 mr-2 animate-spin" />
               ) : isTracking ? (
                 <AppIcon icon="X" className="w-4 h-4 mr-2" />
               ) : (
                 <AppIcon icon="Navigation" className="w-4 h-4 mr-2" />
               )}
               {isTracking ? t.stopTracking : t.startTracking}
             </Button>
 
             {error && (
               <div className="mt-3 p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
                 <AppIcon icon="AlertCircle" className="w-4 h-4 text-destructive mt-0.5" />
                 <p className="text-sm text-destructive">{error}</p>
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* Auto-play Toggle */}
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <AppIcon icon="Radio" className="w-5 h-5 text-primary" />
                 <span className="text-sm font-medium">{t.autoPlayLabel}</span>
               </div>
               <Switch
                 checked={autoPlay}
                 onCheckedChange={setAutoPlay}
               />
             </div>
           </CardContent>
         </Card>
 
         {/* Detection Range Slider */}
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between mb-3">
               <span className="text-sm font-medium">{t.sensitivity}</span>
               <Badge variant="outline">{triggerRadius}m</Badge>
             </div>
             <input
               type="range"
               min="10"
               max="100"
               step="10"
               value={triggerRadius}
               onChange={(e) => setTriggerRadius(Number(e.target.value))}
               className="w-full accent-primary"
             />
             <div className="flex justify-between text-xs text-muted-foreground mt-1">
               <span>10m</span>
               <span>100m</span>
             </div>
           </CardContent>
         </Card>
 
         {/* Nearby Animals */}
         {isTracking && (
           <div className="space-y-3">
             <h2 className="font-semibold text-lg flex items-center gap-2">
               <AppIcon icon="Volume2" className="w-5 h-5 text-primary" />
               {t.nearbyAnimals}
             </h2>
 
             {!isWithinZoo && position && (
               <Card className="border-destructive/50 bg-destructive/10">
                 <CardContent className="p-4">
                   <div className="flex items-start gap-3">
                     <AppIcon icon="AlertCircle" className="w-5 h-5 text-destructive mt-0.5" />
                     <p className="text-sm text-destructive">{t.outsideZoo}</p>
                   </div>
                 </CardContent>
               </Card>
             )}
 
             {nearbyAnimals.length > 0 ? (
               <div className="space-y-2">
                 {nearbyAnimals.map((animal) => (
                   <Card 
                     key={animal.id}
                     className={cn(
                       "transition-all",
                       animal.distance <= triggerRadius && "border-primary ring-2 ring-primary/20"
                     )}
                   >
                     <CardContent className="p-3">
                       <div className="flex items-center gap-3">
                         <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                           {animal.image_url ? (
                             <img 
                               src={animal.image_url} 
                               alt={animal.name}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <AppIcon icon="Volume2" className="w-6 h-6 text-muted-foreground" />
                             </div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h3 className="font-medium truncate">{animal.name}</h3>
                           <p className="text-xs text-muted-foreground truncate">
                             {animal.latin_name}
                           </p>
                           <div className="flex items-center gap-2 mt-1">
                             <Badge 
                               variant={animal.distance <= triggerRadius ? "default" : "secondary"}
                               className="text-xs"
                             >
                               <AppIcon icon="MapPin" className="w-3 h-3 mr-1" />
                               {getDistanceText(animal.distance)}
                             </Badge>
                             {animal.distance <= triggerRadius && (
                               <Badge variant="outline" className="text-xs text-primary border-primary">
                                 {language === 'en' ? 'In range' : 'Dalam jangkauan'}
                               </Badge>
                             )}
                           </div>
                         </div>
                         <Button
                           size="sm"
                           variant={animal.audio_url ? "default" : "ghost"}
                           disabled={!animal.audio_url}
                           onClick={() => handlePlayAnimal(animal)}
                           className="flex-shrink-0"
                         >
                           {animal.audio_url ? (
                             <>
                               <AppIcon icon="Volume2" className="w-4 h-4 mr-1" />
                               {t.listenNow}
                             </>
                           ) : (
                             <span className="text-xs text-muted-foreground">{t.noAudio}</span>
                           )}
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             ) : isWithinZoo ? (
               <Card>
                 <CardContent className="p-6 text-center">
                   <AppIcon icon="Navigation" className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                   <p className="text-muted-foreground">{t.noNearby}</p>
                 </CardContent>
               </Card>
             ) : null}
           </div>
         )}
 
         {/* How to Use - Show when not tracking */}
         {!isTracking && (
           <Card>
             <CardContent className="p-4">
               <h3 className="font-semibold mb-3 flex items-center gap-2">
                 <AppIcon icon="Headphones" className="w-5 h-5 text-primary" />
                 {t.howToUse}
               </h3>
               <div className="space-y-3">
                 {[t.step1, t.step2, t.step3].map((step, i) => (
                   <div key={i} className="flex items-start gap-3">
                     <div className="w-6 h-6 rounded-full bg-primary/10 text-primary-foreground bg-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                       {i + 1}
                     </div>
                     <p className="text-sm text-muted-foreground">{step}</p>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}
       </div>
 
       {/* Audio Player Modal */}
       {showPlayer && selectedAnimal?.audio_url && (
         <AnimalAudioPlayer
           audioUrl={selectedAnimal.audio_url}
           animalName={selectedAnimal.name}
           onClose={handleClosePlayer}
         />
       )}
     </div>
   );
 }