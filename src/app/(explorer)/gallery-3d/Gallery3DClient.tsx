"use client";

import { useState, Suspense, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, useGLTF, Center } from '@react-three/drei';
import { Box, Loader2, ChevronLeft, ChevronRight, Info, RotateCcw, ZoomIn, ZoomOut, X, Maximize2, ShieldAlert, MapPin } from 'lucide-react';
import { useAnimals } from '@/hooks/useAnimals';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import * as THREE from 'three';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Model configurations for different animal types
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
  default: { scale: 1.5, position: [0, -0.5, 0], color: '#8B4513' }
};

// GLB Model component
function GLBModel({ url, scale, position }: { url: string; scale: number; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef} position={position} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    </Float>
  );
}

// Placeholder model
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
        <p className="font-medium">Memuat Model 3D...</p>
      </div>
    </Html>
  );
}

// Error boundary
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

  componentDidCatch(error: any) {
    console.warn('3D model load failed, fallback rendered:', error);
  }

  componentDidUpdate(prevProps: { children: React.ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Animal Model with error handling
function AnimalModel({ name, customModelUrl }: { name: string; customModelUrl?: string | null }) {
  if (customModelUrl && (customModelUrl.startsWith('http') || customModelUrl.startsWith('/'))) {
    return (
      <ErrorBoundary fallback={<PlaceholderAnimal name={name} />}>
        <Suspense fallback={<LoadingFallback />}>
          <GLBModel url={customModelUrl} scale={2} position={[0, -0.5, 0]} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return <PlaceholderAnimal name={name} />;
}

// Scene component
interface SceneProps {
  animalName: string;
  autoRotate: boolean;
  customModelUrl?: string | null;
  controlsRef: React.RefObject<any>;
}

function Scene3D({ animalName, autoRotate, customModelUrl, controlsRef }: SceneProps) {
  return (
    <>
      <hemisphereLight intensity={0.6} color="#87ceeb" groundColor="#2d5a3d" />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffcc77" />
      <spotLight position={[0, 10, 0]} angle={0.4} intensity={0.8} penumbra={1} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#2d5a3d" roughness={0.8} metalness={0.1} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
        <ringGeometry args={[3.5, 4, 64]} />
        <meshStandardMaterial color="#1a4a2e" roughness={0.9} />
      </mesh>
      
      <Center position={[0, 0, 0]}>
        <AnimalModel name={animalName} customModelUrl={customModelUrl} />
      </Center>
      
      <OrbitControls 
        ref={controlsRef}
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

// Gallery Card Component
interface GalleryCardProps {
  animal: {
    id: number;
    name: string;
    name_en?: string | null;
    latin_name?: string | null;
    image_url?: string | null;
    model_url?: string | null;
    zone?: string | null;
  };
  onClick: () => void;
}

function GalleryCard({ animal, onClick }: GalleryCardProps) {
  const { language } = useLanguage();
  return (
    <div 
      onClick={onClick}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
    >
      <div className="aspect-square relative overflow-hidden">
        {animal.image_url ? (
          <img 
            src={animal.image_url} 
            alt={(language === 'en' && animal.name_en) ? animal.name_en : animal.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Box className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        {/* 3D Badge */}
        <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Box className="w-3 h-3" />
          3D
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-white font-medium text-sm flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            Lihat Model 3D
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
          {(language === 'en' && animal.name_en) ? animal.name_en : animal.name}
        </h3>
        {animal.latin_name && (
          <p className="text-sm text-muted-foreground italic">{animal.latin_name}</p>
        )}
        {animal.zone && (
          <span className="inline-block mt-2 text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
            {animal.zone}
          </span>
        )}
      </div>
    </div>
  );
}

// Fullscreen 3D Viewer Modal
interface ViewerModalProps {
  animal: {
    id: number;
    name: string;
    name_en?: string | null;
    latin_name?: string | null;
    model_url?: string | null;
    zone?: string | null;
    description?: string | null;
    description_en?: string | null;
  };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function ViewerModal({ animal, onClose, onPrev, onNext, hasPrev, hasNext }: ViewerModalProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);
  const { language } = useLanguage();

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, 1);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, -1);
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{(language === 'en' && animal.name_en) ? animal.name_en : animal.name}</h2>
          {animal.latin_name && (
            <p className="text-slate-300 text-sm italic font-semibold">{animal.latin_name}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showInfo ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Info Panel */}
      {showInfo && animal.description && (
        <div className="absolute top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-black/80 backdrop-blur-md rounded-2xl p-4 z-10 max-h-48 overflow-y-auto">
          <p className="text-white font-medium text-sm leading-relaxed">{animal.description}</p>
          {animal.zone && (
            <p className="text-secondary text-xs mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-secondary shrink-0" />
              <span>{animal.zone}</span>
            </p>
          )}
        </div>
      )}

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 45 }}
          style={{ background: 'linear-gradient(180deg, #1a4a2e 0%, #0d2818 50%, #061208 100%)' }}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Scene3D 
            animalName={(language === 'en' && animal.name_en) ? animal.name_en : animal.name} 
            autoRotate={autoRotate} 
            customModelUrl={animal.model_url}
            controlsRef={controlsRef}
          />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
              autoRotate 
                ? 'bg-primary text-slate-950' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {autoRotate ? 'Auto Putar: ON' : 'Auto Putar: OFF'}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/30 transition-colors"
          >
            Reset
          </button>
          
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-400 font-medium text-xs text-center">
          Sentuh & geser untuk memutar • Cubit untuk zoom
        </p>
      </div>
    </div>
  );
}

// Main Gallery Component
export default function Gallery3D() {
  const { animals, loading } = useAnimals();
  const { arEnabled, loading: flagsLoading } = useFeatureFlags();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // All animals can have 3D models (either custom or default)
  const animalsWithModels = animals;

  const selectedAnimal = selectedIndex !== null ? animalsWithModels[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < animalsWithModels.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (loading || flagsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <Box className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Memuat galeri 3D...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!arEnabled) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-card border shadow-sm">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Fitur Galeri 3D & AR Nonaktif</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Modul pemutaran AR dan Model 3D saat ini sedang dinonaktifkan oleh administrator sistem.
          </p>
          <Link href="/fauna" className="btn-explorer-primary inline-flex items-center justify-center px-6 py-2.5">
            Kembali ke Jelajah Satwa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Galeri 3D Satwa</h1>
            <p className="text-muted-foreground">Jelajahi model 3D satwa Ragunan secara interaktif</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Cara Menggunakan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Klik kartu satwa untuk membuka viewer 3D. Gunakan gestur sentuh atau mouse untuk memutar, 
              dan cubit/scroll untuk zoom. Gunakan tombol panah untuk navigasi antar satwa.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {animalsWithModels.length === 0 ? (
        <div className="text-center py-16">
          <Box className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Model 3D</h3>
          <p className="text-muted-foreground mb-4">Model 3D satwa sedang dalam pengembangan.</p>
          <Link 
            href="/fauna"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Lihat semua satwa
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {animalsWithModels.map((animal, index) => (
            <GalleryCard 
              key={animal.id} 
              animal={animal}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedAnimal && (
        <ViewerModal
          animal={selectedAnimal}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={selectedIndex !== null && selectedIndex > 0}
          hasNext={selectedIndex !== null && selectedIndex < animalsWithModels.length - 1}
        />
      )}
    </div>
  );
}


