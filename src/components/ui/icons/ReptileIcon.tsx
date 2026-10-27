import React, { forwardRef } from 'react';

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const ReptileIcon = forwardRef<SVGSVGElement, SvgIconProps>(
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
        {/* S-curve reptilian spine & body */}
        <path d="m12 3 2 3c1 1.5 1 3.5 0 5-.6 1-1 2-1 3.5s.8 2.5 1 3.5c.3 1.5-.5 3-2 3" />
        <path d="m12 3-2 3c-1 1.5-1 3.5 0 5 .6 1 1 2 1 3.5s-.8 2.5-1 3.5c-.3 1.5.5 3 2 3" />
        {/* Front splayed legs */}
        <path d="M8.5 7.5 5 6l-1 2" />
        <path d="M15.5 7.5 19 6l1 2" />
        {/* Hind splayed legs */}
        <path d="M9.5 15.5 6 17l1 2" />
        <path d="M14.5 15.5 18 17l-1 2" />
        {/* Head details (eyes) */}
        <circle cx="11" cy="5" r=".5" fill="currentColor" />
        <circle cx="13" cy="5" r=".5" fill="currentColor" />
      </svg>
    );
  }
);

ReptileIcon.displayName = 'ReptileIcon';
export default ReptileIcon;
