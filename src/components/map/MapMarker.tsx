import { 
  MapPin, 
  PawPrint, 
  Ticket, 
  Utensils, 
  HeartPulse, 
  Compass, 
  Train, 
  Sparkles,
  Bath
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MapPointType } from './zoneConfig';

interface MapMarkerProps {
  zone: string;
  position: { x: number; y: number };
  color: string;
  onClick: () => void;
  isActive?: boolean;
  iconType?: MapPointType;
}

export default function MapMarker({ 
  zone, 
  position, 
  color, 
  onClick, 
  isActive,
  iconType = 'animal'
}: MapMarkerProps) {
  // Render specific icon according to facility/zone type
  const renderIcon = () => {
    const iconClass = "w-3.5 h-3.5 md:w-4 md:h-4 text-white";
    switch (iconType) {
      case 'toilet':
        return <Bath className={iconClass} />;
      case 'musholla':
        return <Compass className={iconClass} />;
      case 'tram':
        return <Train className={iconClass} />;
      case 'ticket':
        return <Ticket className={iconClass} />;
      case 'kuliner':
        return <Utensils className={iconClass} />;
      case 'medical':
        return <HeartPulse className={iconClass} />;
      case 'animal':
        return <PawPrint className={iconClass} />;
      default:
        return <MapPin className={iconClass} />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2",
        "transition-all duration-200 hover:scale-125 focus:outline-none focus:scale-125",
        "group z-10",
        isActive && "scale-125"
      )}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      aria-label={`Lihat zona atau fasilitas ${zone}`}
    >
      {/* Marker Icon - centered on the point */}
      <div className={cn(
        "relative flex flex-col items-center",
        isActive ? "animate-bounce-slow" : ""
      )}>
        <div 
          className={cn(
            "p-1.5 md:p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900",
            "transition-shadow duration-200 group-hover:shadow-xl flex items-center justify-center"
          )}
          style={{ backgroundColor: color }}
        >
          {renderIcon()}
        </div>
        
        {/* Zone Label */}
        <div className={cn(
          "absolute top-full mt-1 whitespace-nowrap",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md border border-border/60",
          "text-[10px] md:text-xs font-bold pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isActive && "opacity-100"
        )}
        style={{ color }}
        >
          {zone}
        </div>
      </div>
      
      {/* Pulse Effect - centered */}
      <span 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping pointer-events-none",
          isActive ? "w-10 h-10 opacity-40" : "w-7 h-7 opacity-20"
        )}
        style={{ backgroundColor: color }}
      />
    </button>
  );
}
