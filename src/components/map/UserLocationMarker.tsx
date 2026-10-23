import { Navigation2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserLocationMarkerProps {
  position: { x: number; y: number };
  accuracy?: number;
  heading?: number;
  isLoading?: boolean;
}

export default function UserLocationMarker({ 
  position, 
  accuracy = 10,
  heading,
  isLoading = false 
}: UserLocationMarkerProps) {
  // Scale accuracy circle (min 20px, max 60px)
  const accuracySize = Math.min(60, Math.max(20, accuracy / 2));

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Accuracy Circle - using primary color with opacity */}
      <div
        className={cn(
          "absolute rounded-full bg-primary/20 border-2 border-primary/40",
          isLoading && "animate-pulse"
        )}
        style={{
          width: accuracySize,
          height: accuracySize,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
        }}
      />

      {/* Pulse Animation */}
      <div
        className="absolute rounded-full bg-primary/30 animate-ping"
        style={{
          width: 32,
          height: 32,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
        }}
      />

      {/* User Location Dot */}
      <div className="relative">
        <div className="w-5 h-5 rounded-full bg-primary border-[3px] border-background shadow-lg flex items-center justify-center">
          {heading !== undefined ? (
            <Navigation2 
              className="w-3 h-3 text-primary-foreground" 
              style={{ transform: `rotate(${heading}deg)` }}
            />
          ) : null}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] text-primary font-medium bg-background/80 px-1.5 py-0.5 rounded-full shadow-sm">
            Mencari...
          </span>
        </div>
      )}
    </div>
  );
}
