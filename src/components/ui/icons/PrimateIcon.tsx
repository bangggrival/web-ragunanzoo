import React, { forwardRef } from 'react';
import type { LucideProps, LucideIcon } from 'lucide-react';

export const PrimateIcon: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {/* Head outline */}
        <circle cx="12" cy="12" r="7" />
        {/* Characteristic rounded primate ears */}
        <path d="M5 9.5a2.5 2.5 0 0 0 0 5" />
        <path d="M19 9.5a2.5 2.5 0 0 1 0 5" />
        {/* Brow ridge / Schmutzer ape eyebrow arch */}
        <path d="M8.5 10c.8-.8 2.2-.8 3.5.8 1.3-1.6 2.7-1.6 3.5-.8" />
        {/* Eyes */}
        <circle cx="10" cy="11.5" r=".5" fill="currentColor" />
        <circle cx="14" cy="11.5" r=".5" fill="currentColor" />
        {/* Muzzle / nose and mouth */}
        <path d="M11 14h2" />
        <path d="M9.5 16c1 1 4 1 5 0" />
      </svg>
    );
  }
);

PrimateIcon.displayName = 'PrimateIcon';
export default PrimateIcon;
