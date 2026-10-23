"use client";

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Center, Float, useGLTF } from '@react-three/drei';
import { X, RotateCcw, Smartphone, Loader2, Move3D, Box, Sun, Moon, Sunset, Volume2 } from 'lucide-react';
import * as THREE from 'three';
import { wildlifeAudio } from '@/utils/WildlifeAudioSynthesizer';

interface ARViewerProps {
  animalName: string;
  animalType?: string;
  modelUrl?: string | null;
  onClose: () => void;
}

// Animal model configuration - uses placeholder when no custom model
interface AnimalModelConfig {
  scale: number;
  position: [number, number, number];
  color: string;
}

const ANIMAL_CONFIGS: Record<string, AnimalModelConfig> = {
  elephant: { scale: 1.5, position: [0, -0.5, 0], color: '#808080' },
  tiger: { scale: 2, position: [0, -0.5, 0], color: '#F59E0B' },
  monkey: { scale: 2, position: [0, -0.5, 0], color: '#D97706' },
  bird: { scale: 2, position: [0, -0.5, 0], color: '#3B82F6' },
  reptile: { scale: 2, position: [0, -0.5, 0], color: '#22C55E' },
  default: { scale: 1.5, position: [0, -0.5, 0], color: '#8B4513' }
};

// Get animal config based on name
function getAnimalConfig(name: string): AnimalModelConfig {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('gajah') || lowerName.includes('elephant')) {
    return ANIMAL_CONFIGS.elephant;
  }
  if (lowerName.includes('harimau') || lowerName.includes('tiger') || lowerName.includes('kucing')) {
    return ANIMAL_CONFIGS.tiger;
  }
  if (lowerName.includes('orangutan') || lowerName.includes('bekantan') || lowerName.includes('monyet') || lowerName.includes('primata')) {
    return ANIMAL_CONFIGS.monkey;
  }
  if (lowerName.includes('burung') || lowerName.includes('bird') || lowerName.includes('merak') || lowerName.includes('elang')) {
    return ANIMAL_CONFIGS.bird;
  }
  if (lowerName.includes('komodo') || lowerName.includes('ular') || lowerName.includes('buaya') || lowerName.includes('reptil')) {
    return ANIMAL_CONFIGS.reptile;
  }
  
  return ANIMAL_CONFIGS.default;
}

// GLB Model loader component - only used when custom model URL is provided
function GLBModel({ url, scale, position }: { url: string; scale: number; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  
  const clonedScene = React.useMemo(() => scene?.clone() || null, [scene]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  if (!clonedScene) {
    return null;
  }

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef} position={position} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    </Float>
  );
}

// Fallback placeholder when model fails to load
function PlaceholderAnimal({ name }: { name: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const getColor = () => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('gajah')) return '#808080';
    if (lowerName.includes('harimau')) return '#F59E0B';
    if (lowerName.includes('orangutan')) return '#D97706';
    return '#8B4513';
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
          <meshStandardMaterial color={getColor()} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color={getColor()} roughness={0.6} />
        </mesh>
        <mesh position={[-0.12, 0.95, 0.28]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.12, 0.95, 0.28]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {[[-0.25, -0.6, 0], [0.25, -0.6, 0]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
            <meshStandardMaterial color={getColor()} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-white">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Box className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
        </div>
        <div className="text-center">
          <p className="font-medium">Memuat Model 3D...</p>
          <p className="text-xs text-white/60 mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    </Html>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Animal model with error handling - shows placeholder or custom GLB model
function AnimalModel({ name, customModelUrl }: { name: string; customModelUrl?: string | null }) {
  const config = getAnimalConfig(name);
  
  // If custom model URL is provided, try to load it
  if (customModelUrl) {
    return (
      <ErrorBoundary fallback={<PlaceholderAnimal name={name} />}>
        <Suspense fallback={<LoadingFallback />}>
          <GLBModel 
            url={customModelUrl} 
            scale={2} 
            position={[0, -0.5, 0]} 
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Otherwise show placeholder model (no external URL dependencies)
  return <PlaceholderAnimal name={name} />;
}

// 3D Scene content
function Scene3D({
  animalName,
  autoRotate,
  customModelUrl,
  lightingMode = 'day',
}: {
  animalName: string;
  autoRotate: boolean;
  customModelUrl?: string | null;
  lightingMode?: 'day' | 'sunset' | 'night';
}) {
  const lightSettings = {
    day: { ambient: '#ffffff', hemi: '#87ceeb', ground: '#2d5a3d', dir: '#fff4e6', int: 1.2 },
    sunset: { ambient: '#fdba74', hemi: '#fb923c', ground: '#451a03', dir: '#f97316', int: 1.4 },
    night: { ambient: '#1e293b', hemi: '#38bdf8', ground: '#022c22', dir: '#60a5fa', int: 0.7 },
  }[lightingMode];

  return (
    <>
      <hemisphereLight intensity={0.7} color={lightSettings.hemi} groundColor={lightSettings.ground} />
      <ambientLight intensity={lightSettings.int * 0.6} color={lightSettings.ambient} />
      <directionalLight position={[5, 10, 5]} intensity={lightSettings.int} color={lightSettings.dir} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffcc77" />
      <spotLight position={[0, 10, 0]} angle={0.4} intensity={0.8} penumbra={1} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color={lightingMode === 'night' ? '#0f291e' : '#2d5a3d'} roughness={0.8} metalness={0.1} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
        <ringGeometry args={[3.5, 4, 64]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.9} />
      </mesh>
      
      <Center position={[0, 0, 0]}>
        <AnimalModel name={animalName} customModelUrl={customModelUrl} />
      </Center>
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.5, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Check WebXR support
function useWebXRSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setIsSupported(supported);
        } catch {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);
  
  return isSupported;
}

export default function ARViewer({ animalName, modelUrl, onClose }: ARViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<'day' | 'sunset' | 'night'>('day');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const isARSupported = useWebXRSupport();
  
  // Use custom model URL from Supabase Storage if available
  const customModelUrl = modelUrl || null;

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Prevent scrolling when AR viewer is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      wildlifeAudio.stopAll();
    };
  }, []);

  const handlePlaySound = () => {
    if (isPlayingSound) {
      wildlifeAudio.stopAll();
      setIsPlayingSound(false);
    } else {
      setIsPlayingSound(true);
      const soundType = wildlifeAudio.detectSoundType(animalName);
      wildlifeAudio.playAnimalSound(soundType, () => {
        setIsPlayingSound(false);
      });
    }
  };

  const bgGradient = {
    day: 'linear-gradient(180deg, #1a4a2e 0%, #0d2818 50%, #061208 100%)',
    sunset: 'linear-gradient(180deg, #451a03 0%, #291004 50%, #0f0501 100%)',
    night: 'linear-gradient(180deg, #0f172a 0%, #020617 50%, #000000 100%)',
  }[lightingMode];

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col" style={{ backgroundColor: '#000000' }}>
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-20">
        <div>
          <h2 className="text-white font-bold text-lg">{animalName}</h2>
          <p className="text-white/70 text-sm flex items-center gap-1">
            <Move3D className="w-4 h-4 text-emerald-400" />
            Studio 3D & AR Explorer
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95"
          aria-label="Tutup AR Viewer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 45 }}
          style={{ background: bgGradient }}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Scene3D
              animalName={animalName}
              autoRotate={autoRotate}
              customModelUrl={customModelUrl}
              lightingMode={lightingMode}
            />
          </Suspense>
        </Canvas>

        {/* Interaction hints */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-white/90 text-xs sm:text-sm flex items-center gap-2 shadow-lg">
            <Move3D className="w-4 h-4 text-emerald-400" />
            <span>Sentuh & geser untuk memutar 360°</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12">
        {/* Floating Controls Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
          {/* Lighting Mode Selector */}
          <div className="flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            <button
              onClick={() => setLightingMode('day')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                lightingMode === 'day' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Siang</span>
            </button>
            <button
              onClick={() => setLightingMode('sunset')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                lightingMode === 'sunset' ? 'bg-orange-500 text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Senja</span>
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                lightingMode === 'night' ? 'bg-indigo-600 text-white shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Malam</span>
            </button>
          </div>

          {/* Sound Trigger Button */}
          <button
            onClick={handlePlaySound}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md border transition-all ${
              isPlayingSound
                ? 'bg-amber-500 text-white border-amber-300 ring-4 ring-amber-400/30'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlayingSound ? 'animate-pulse' : ''}`} />
            <span>{isPlayingSound ? 'Bersuara...' : 'Suara Satwa'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md border transition-all ${
              autoRotate
                ? 'bg-primary text-primary-foreground border-primary/40'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{autoRotate ? 'Auto Putar: ON' : 'Auto Putar: OFF'}</span>
          </button>
        </div>

        {/* AR Status */}
        {isARSupported === true ? (
          <div className="bg-primary/90 rounded-2xl p-4 text-center">
            <Smartphone className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">AR tersedia di perangkat Anda!</p>
            <p className="text-white/70 text-xs mt-1">Fitur AR penuh akan segera hadir</p>
          </div>
        ) : (
          <div className="bg-muted/20 border border-white/20 rounded-2xl p-4 text-center">
            <Box className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-white font-medium text-sm">Mode 3D Interaktif</p>
            <p className="text-white/60 text-xs mt-1">Model 3D dengan interaksi sentuh</p>
          </div>
        )}

        <p className="text-white/40 text-xs text-center mt-3">
          Model 3D dari sumber terbuka • Geser untuk memutar • Cubit untuk zoom
        </p>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}

// No preloading needed - we use placeholder models by default
// Custom models from Supabase Storage will be loaded on-demand