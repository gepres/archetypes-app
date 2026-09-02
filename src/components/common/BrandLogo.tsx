import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7 rounded-lg text-sm',
    md: 'w-9 h-9 rounded-xl text-base',
    lg: 'w-11 h-11 rounded-2xl text-xl',
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[size];

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG Icon */}
      <div
        className={`${iconDimensions} bg-gradient-to-br from-[#1C2C24] via-[#121A17] to-[#0A100E] border border-[#D6A84F]/60 flex items-center justify-center text-[#D6A84F] shadow-lg relative group-hover:border-[#D6A84F] group-hover:shadow-[#D6A84F]/20 transition-all shrink-0`}
      >
        {/* Subtle internal ring */}
        <div className="absolute inset-0.5 rounded-[inherit] border border-[#315C45]/40 pointer-events-none" />

        {/* Vector Monogram with Crown Apex */}
        <svg
          viewBox="0 0 40 40"
          className="w-3/4 h-3/4 text-[#D6A84F]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Octagram Ray Points */}
          <line x1="20" y1="2" x2="20" y2="6" stroke="#D6A84F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="20" y1="34" x2="20" y2="38" stroke="#D6A84F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="2" y1="20" x2="6" y2="20" stroke="#D6A84F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="34" y1="20" x2="38" y2="20" stroke="#D6A84F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* Crown Top Tri-Points */}
          <path
            d="M14 13L20 8L26 13L23 14L20 11.5L17 14L14 13Z"
            fill="currentColor"
          />
          <circle cx="20" cy="7.5" r="1.2" fill="#FFF3C4" />

          {/* Letter 'A' Form */}
          <path
            d="M20 11L27 29H23.5L21.8 24.5H18.2L16.5 29H13L20 11ZM20 18.5L19.2 21.5H20.8L20 18.5Z"
            fill="currentColor"
          />

          {/* Center Emerald Light */}
          <circle cx="20" cy="20.5" r="1.5" fill="#86EFAC" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center text-left">
          <span
            className={`font-serif font-bold tracking-tight text-[#F2EFE6] leading-none ${titleSizes}`}
          >
            Arquetipos
          </span>
          <span
            className={`text-[#9DA79F] tracking-widest uppercase font-semibold mt-0.5 ${subSizes}`}
          >
            Universales
          </span>
        </div>
      )}
    </div>
  );
};
