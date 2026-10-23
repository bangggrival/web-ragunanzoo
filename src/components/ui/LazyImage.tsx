import { useState, useRef, forwardRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  wrapperClassName?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  fallback?: string;
  blur?: boolean;
}

const LazyImage = forwardRef<HTMLDivElement, LazyImageProps>(({
  src,
  alt,
  className,
  placeholderClassName,
  wrapperClassName,
  aspectRatio = 'auto',
  fallback = '/placeholder.svg',
  blur = true,
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    auto: '',
  };

  const imageSrc = hasError || !src ? fallback : src;
  const isSvgOrData = typeof imageSrc === 'string' && (
    imageSrc.startsWith('data:') || 
    imageSrc.startsWith('blob:') || 
    imageSrc.endsWith('.svg') ||
    imageSrc.includes('.svg?')
  );

  return (
    <div 
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectClasses[aspectRatio],
        wrapperClassName
      )}
    >
      {/* Shimmer loading placeholder */}
      <div
        className={cn(
          'absolute inset-0 z-0 transition-opacity duration-500',
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100',
          placeholderClassName
        )}
      >
        <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer bg-[length:200%_100%]" />
      </div>

      {/* Next.js Optimized Image */}
      <Image
        src={imageSrc}
        alt={alt || 'Foto Ragunan Zoo'}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        unoptimized={isSvgOrData}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={cn(
          'object-cover transition-all duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          blur && !isLoaded ? 'scale-105 blur-sm' : 'scale-100 blur-0',
          className
        )}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
