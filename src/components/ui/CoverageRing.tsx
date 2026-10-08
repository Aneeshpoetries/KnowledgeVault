'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface CoverageRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  captured?: number;
  atRisk?: number;
  missing?: number;
}

export function CoverageRing({
  score,
  size = 180,
  strokeWidth = 10,
  label = 'CONTINUITY',
  sublabel = 'Organizational Memory',
  captured,
  atRisk,
  missing,
}: CoverageRingProps) {
  const reduced = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const color =
    normalizedScore >= 70
      ? 'var(--accent-indigo)'
      : normalizedScore >= 50
      ? '#06B6D4' // cyan
      : normalizedScore >= 35
      ? '#F59E0B' // amber
      : '#EF4444'; // red

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--vault-subtle)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Subtle grid track ticks */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--vault-border)"
          strokeWidth={strokeWidth / 2}
          strokeDasharray="2 12"
          fill="transparent"
          opacity={0.4}
        />
        {/* Progress ring with smooth easeOut */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: reduced ? 0 : .6, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Center metrics */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="text-[11px] font-mono tracking-widest uppercase text-vault-dim">
          {label}
        </span>
        <motion.span
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : .3 }}
          className="text-4xl sm:text-5xl font-semibold tracking-tight text-vault-text my-0.5"
        >
          {normalizedScore}%
        </motion.span>
        <span className="text-[11px] text-vault-muted font-normal max-w-[100px] leading-tight">
          {sublabel}
        </span>
      </div>
    </div>
  );
}
