import { useSiteSettings } from '@/hooks/useSiteSettings';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingScreen({ 
  fullScreen = false, 
  message,
  size = 'md' 
}: LoadingScreenProps) {
  const { settings } = useSiteSettings();
  
  // Use loading logo from database only - no fallback to bundled assets
  const loadingLogo = settings?.loading_logo_url || settings?.logo_url;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      {/* Animated Logo - only show if logo exists in database */}
      <div className="relative">
        {loadingLogo ? (
          <>
            {/* Glow effect */}
            <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-primary/20 blur-xl animate-pulse`} />
            
            {/* Logo with animations */}
            <img 
              src={loadingLogo} 
              alt="Loading..." 
              className={`${sizeClasses[size]} object-contain relative z-10 animate-float drop-shadow-lg`}
            />
            
            {/* Rotating ring */}
            <div 
              className={`absolute inset-0 ${sizeClasses[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin`}
              style={{ animationDuration: '1.5s' }}
            />
          </>
        ) : (
          /* Simple spinner when no logo configured */
          <div 
            className={`${sizeClasses[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin`}
            style={{ animationDuration: '1s' }}
          />
        )}
      </div>
      
      {/* Loading text */}
      {message && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
      
      {/* Loading dots */}
      <div className="flex gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
