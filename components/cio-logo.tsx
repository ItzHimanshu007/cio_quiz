'use client';

export function CioLogo({ size = 'md', showSubtitle = true }: { size?: 'sm' | 'md' | 'lg'; showSubtitle?: boolean }) {
  const scale = size === 'sm' ? 'scale-75 origin-left' : size === 'lg' ? 'scale-110' : '';

  return (
    <div className={`inline-flex flex-col items-center ${scale}`}>
      {/* CIO Association Colorful Text Logo */}
      <div className="flex items-center gap-1">
        <span className="font-extrabold text-[#DC2626] text-2xl sm:text-3xl tracking-tight leading-none">c</span>
        <span className="font-extrabold text-[#F59E0B] text-2xl sm:text-3xl tracking-tight leading-none">i</span>
        <div className="relative inline-flex items-center justify-center">
          <span className="font-extrabold text-[#2563EB] text-2xl sm:text-3xl tracking-tight leading-none">O</span>
          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#2563EB] ring-1 ring-white" />
          <span className="absolute -bottom-0.5 -left-0.5 size-1.5 rounded-full bg-[#DC2626] ring-1 ring-white" />
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase text-[#3E150F] dark:text-[#E8C59C] mt-0.5">
        CIO Association
      </span>

      {/* BFSI Crimson Ribbon Badge */}
      <div className="relative mt-0.5 flex items-center justify-center">
        <div className="relative bg-[#BE123C] text-white px-5 py-0.5 text-[10px] sm:text-[11px] font-black tracking-[0.24em] shadow-sm uppercase">
          {/* Left Ribbon Notch */}
          <span className="absolute -left-1.5 top-0 bottom-0 w-2 bg-[#9F1239] [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
          B F S I
          {/* Right Ribbon Notch */}
          <span className="absolute -right-1.5 top-0 bottom-0 w-2 bg-[#9F1239] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
        </div>
      </div>
      {showSubtitle && (
        <span className="text-[8px] font-semibold tracking-wider text-[#C85210] dark:text-[#E5A967] uppercase mt-1">
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
