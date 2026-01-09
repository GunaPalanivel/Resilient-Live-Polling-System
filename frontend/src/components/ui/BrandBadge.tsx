import React from 'react';
import '../../styles/tokens.css';

interface BrandBadgeProps {
  className?: string;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white text-sm font-medium shadow-md ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(119, 101, 218, 0.3)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1L10.5 6L16 7L12 11L13 16L8 13.5L3 16L4 11L0 7L5.5 6L8 1Z"
          fill="white"
        />
      </svg>
      <span>Intervue Poll</span>
    </div>
  );
};
