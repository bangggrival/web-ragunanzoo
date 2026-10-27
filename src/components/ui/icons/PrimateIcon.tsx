import React, { forwardRef } from 'react';

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const PrimateIcon = forwardRef<SVGSVGElement, SvgIconProps>(
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
        {/* Natural Primate/Orangutan Crown & Cheek Flanges */}
        <path d="M12 4C7.5 4 4.5 7.5 4.5 12c0 3.5 1.5 6.5 3.5 8.5C10 22 12 22 12 22s2 0 4-1.5c2-2 3.5-5 3.5-8.5C19.5 7.5 16.5 4 12 4z" />
        {/* Prominent Ape Brow Arch */}
        <path d="M8 10.5c1.2-1 2.8-.5 4 .5 1.2-1 2.8-1.5 4-.5" />
        {/* Intelligent Deep Eyes */}
        <circle cx="9.5" cy="12" r=".75" fill="currentColor" />
        <circle cx="14.5" cy="12" r=".75" fill="currentColor" />
        {/* Primate Muzzle & Nostrils */}
        <ellipse cx="12" cy="16" rx="3" ry="2" />
        <circle cx="11" cy="15.5" r=".4" fill="currentColor" />
        <circle cx="13" cy="15.5" r=".4" fill="currentColor" />
        <path d="M10.5 17.2c.8.5 2.2.5 3 0" />
      </svg>
    );
  }
);

PrimateIcon.displayName = 'PrimateIcon';
export default PrimateIcon;
