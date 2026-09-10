'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, Radio, Trophy } from 'lucide-react';
import { CioLogo, EventDateBadge } from '@/components/cio-logo';

export default function Leaderboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      fetch('/api/leaderboard')
        .then((r) => r.json())
        .then((d: any) => {
          setRows(d.leaderboard || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="rajasthan-backdrop min-h-screen text-[#FFF8F0]">
      {/* Header */}
      <header className="mx-auto flex h-24 max-w-6xl items-center justify-between px-5 border-b border-[#D97706]/20 bg-[#1C0C08]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-1.5 text-xs font-bold text-[#FDE68A] hover:text-[#F59E0B] uppercase tracking-wider">
            <ChevronLeft className="size-4" /> Home
          </a>
          <div className="h-6 w-px bg-[#D97706]/30" />
          <CioLogo size="sm" showSubtitle={false} />
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-[#BE123C]/20 border border-[#BE123C]/40 px-3 py-1 text-xs font-bold text-[#FCA5A5]">
            <Radio className="size-3.5 text-[#EF4444] animate-pulse" /> LIVE RANKINGS
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 sm:py-12">
        <div className="text-center">
          <EventDateBadge />
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white">
            <span className="text-saffron-gradient">Leaderboard</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#C9A88F]">
            Rankings update live as delegates verify attendance and submit session feedback.
          </p>
        </div>

        <div className="mt-10">
          {rows.length > 0 ? (
            <div className="space-y-3">
              {rows.map((r: any, i) => (
                <div
                  key={r.name + i}
                  className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-2xl border p-4 sm:grid-cols-[56px_1fr_120px_110px] transition ${
                    i === 0
                      ? 'rajasthan-card-gold border-[#F59E0B]/50'
                      : i < 3
                      ? 'rajasthan-card border-[#D97706]/30'
                      : 'bg-[#240E0A]/80 border-white/5'
                  }`}
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl font-black text-sm sm:text-base ${
                      i === 0
                        ? 'bg-[#F59E0B] text-[#1C0C08]'
                        : i === 1
                        ? 'bg-[#E5E7EB] text-[#1F2937]'
                        : i === 2
                        ? 'bg-[#D97706] text-[#1C0C08]'
                        : 'bg-[#3E150F] text-[#FDE68A]'
                    }`}
                  >
                    {i === 0 ? <Trophy className="size-5" /> : i + 1}
                  </span>

                  <div>
                    <p className="font-bold text-base sm:text-lg text-white">{r.name}</p>
                    <p className="text-xs text-[#C9A88F]">{r.company}</p>
                  </div>

                  <div className="hidden text-center sm:block">
                    <strong className="text-white text-base">{r.sessionsAttended}</strong>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A88F]">
                      SESSIONS
                    </span>
                  </div>

                  <strong className="text-right text-xl font-black text-[#F59E0B] sm:text-2xl">
                    {r.totalPoints}
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A88F]">
                      POINTS
                    </span>
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="rajasthan-card rounded-3xl p-12 text-center border border-[#D97706]/30">
              <Trophy className="mx-auto size-12 text-[#F59E0B]/40" />
              <h2 className="mt-4 text-xl font-bold text-white">
                {loading ? 'Loading Conclave Rankings…' : 'Awaiting First Delegate Check-ins'}
              </h2>
              <p className="mt-2 text-sm text-[#C9A88F]">
                Delegate scores will appear here after attendance verification.
              </p>
              {!loading && (
                <a
                  href="/"
                  className="btn-rajasthan-primary mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3"
                >
                  Check In Now <ArrowRight className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-[#C9A88F]">
          Organized by <strong>CIO Association Rajasthan Chapter</strong> · Mobile numbers are confidential.
        </p>
      </section>
    </main>
  );
}
