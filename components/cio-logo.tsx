'use client';

export interface CioLogoProps {
  /** 'bfsi' includes the red BFSI banner; 'standard' is the clean CIO Association logo */
  variant?: 'bfsi' | 'standard';
  /** Preset height size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show subtle 'Rajasthan Chapter' subtitle below logo */
  showSubtitle?: boolean;
  /** 'dark' renders crisp white text for dark backgrounds, 'light' uses original dark text */
  theme?: 'dark' | 'light';
  /** Extra CSS classes */
  className?: string;
}

export function CioLogo({
  variant = 'bfsi',
  size = 'md',
  showSubtitle = false,
  theme = 'dark',
  className = '',
}: CioLogoProps) {
  const isBfsi = variant === 'bfsi';
  const isDark = theme === 'dark';

  const src = isBfsi
    ? isDark
      ? '/cio-bfsi-logo-white.png'
      : '/cio-bfsi-logo.png'
    : isDark
    ? '/cio-logo-white.png'
    : '/cio-logo.png';

  // Responsive sizing tailored for navigation bars, headers, and cards
  // BFSI logo aspect ratio is ~1.24 (857x690)
  // Standard logo aspect ratio is ~1.47 (1024x697)
  const sizeClasses = {
    sm: isBfsi ? 'h-11 sm:h-12 w-auto' : 'h-8 sm:h-9 w-auto',
    md: isBfsi ? 'h-16 sm:h-20 w-auto' : 'h-12 sm:h-14 w-auto',
    lg: isBfsi ? 'h-24 sm:h-28 w-auto' : 'h-18 sm:h-22 w-auto',
    xl: isBfsi ? 'h-32 sm:h-36 w-auto' : 'h-24 sm:h-28 w-auto',
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={isBfsi ? 'CIO Association BFSI 2030' : 'CIO Association'}
        className={`${sizeClasses} object-contain drop-shadow-sm transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
        decoding="async"
      />
      {showSubtitle && (
        <span className="text-[9px] font-bold tracking-[0.2em] text-[#F59E0B] uppercase mt-1">
          Rajasthan Chapter
        </span>
      )}
    </div>
  );
}

export function EventDateBadge() {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl border border-[#D97706]/40 bg-[#3E140C] p-1.5 sm:p-2 text-white shadow-lg">
      <div className="flex items-center gap-2 rounded-xl bg-[#2A0E08] px-3.5 py-1.5 border border-[#B45309]/30">
        <svg className="size-4 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <div className="flex items-baseline gap-1">
          <strong className="text-xl sm:text-2xl font-black text-white leading-none">12</strong>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FCD34D] leading-tight block">
            SEP<br />2026
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <svg className="size-4 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase leading-tight">
          JAIPUR, <span className="text-[#FCD34D]">RAJASTHAN</span>
        </span>
      </div>
    </div>
  );
}
