import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  variant?: "default" | "card" | "circle" | "text";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shimmer = true, variant = "default", ...props }, ref) => {
    const baseStyles = "rounded-md bg-muted relative overflow-hidden";
    
    const variantStyles = {
      default: "",
      card: "rounded-2xl",
      circle: "rounded-full",
      text: "h-4 rounded",
    };

    const shimmerStyles = shimmer 
      ? "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer before:bg-[length:200%_100%]"
      : "animate-pulse";

    return (
      <div 
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          shimmerStyles,
          className
        )} 
        {...props} 
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Preset skeleton components for common use cases
const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        <Skeleton variant="card" className="h-32 md:h-48 w-full" />
        <div className="space-y-2 p-2">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

const SkeletonAvatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Skeleton 
        ref={ref}
        variant="circle" 
        className={cn("h-10 w-10 md:h-12 md:w-12", className)} 
        {...props} 
      />
    );
  }
);

SkeletonAvatar.displayName = "SkeletonAvatar";

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            className={cn(
              "h-3 md:h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )} 
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = "SkeletonText";

const SkeletonStatCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-white rounded-xl border border-manager-border p-3 md:p-4 space-y-2",
          className
        )} 
        {...props}
      >
        <Skeleton variant="text" className="h-3 w-1/2" />
        <Skeleton className="h-6 md:h-8 w-3/4" />
      </div>
    );
  }
);

SkeletonStatCard.displayName = "SkeletonStatCard";

const SkeletonEventCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-card rounded-2xl p-4 md:p-5 flex gap-3 md:gap-4",
          className
        )} 
        {...props}
      >
        <Skeleton className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/3" />
          <Skeleton variant="text" className="h-5 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
    );
  }
);

SkeletonEventCard.displayName = "SkeletonEventCard";

const SkeletonAnimalCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-card rounded-2xl overflow-hidden shadow-sm",
          className
        )} 
        {...props}
      >
        <Skeleton className="h-32 md:h-48 w-full rounded-none" />
        <div className="p-2.5 md:p-4 space-y-2">
          <Skeleton variant="text" className="h-4 md:h-5 w-2/3" />
          <Skeleton variant="text" className="h-3 w-1/2" />
          <Skeleton variant="text" className="h-3 w-1/3" />
        </div>
      </div>
    );
  }
);

SkeletonAnimalCard.displayName = "SkeletonAnimalCard";

interface SkeletonTableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
}

const SkeletonTableRow = React.forwardRef<HTMLDivElement, SkeletonTableRowProps>(
  ({ columns = 5, className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "flex items-center gap-4 p-4 border-b border-manager-border",
          className
        )} 
        {...props}
      >
        <div className="flex items-center gap-3 flex-1">
          <Skeleton variant="circle" className="w-10 h-10 md:w-12 md:h-12" />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="h-4 w-24 md:w-32" />
            <Skeleton variant="text" className="h-3 w-16 md:w-20" />
          </div>
        </div>
        {Array.from({ length: columns - 2 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 w-16 hidden md:block" />
        ))}
        <div className="flex gap-2">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="circle" className="w-8 h-8" />
        </div>
      </div>
    );
  }
);

SkeletonTableRow.displayName = "SkeletonTableRow";

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonStatCard,
  SkeletonEventCard,
  SkeletonAnimalCard,
  SkeletonTableRow
};
