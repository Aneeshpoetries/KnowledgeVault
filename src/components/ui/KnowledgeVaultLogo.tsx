import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function KnowledgeVaultLogo({ className = 'text-indigo-500', size = 20 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer geometric isometric vault polygon */}
      <path
        d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="opacity-70"
      />
      {/* Inner connected core network nodes */}
      <path
        d="M12 2V12M12 12L21 16.8M12 12L3 16.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="opacity-50"
      />
      {/* Central memory node */}
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      {/* Peripheral memory satellite nodes */}
      <circle cx="12" cy="5" r="1.2" fill="currentColor" className="opacity-90" />
      <circle cx="18" cy="14.5" r="1.2" fill="currentColor" className="opacity-90" />
      <circle cx="6" cy="14.5" r="1.2" fill="currentColor" className="opacity-90" />
    </svg>
  );
}
