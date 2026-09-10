'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { CioLogo, EventDateBadge } from '@/components/cio-logo';

export default function WinnerPage() {
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/winner')
      .then((r) => r.json())
      .then((d: any) => {
        setWinner(d.winner);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="rajasthan-backdrop grid min-h-screen place-items-center p-5 text-[#FFF8F0]">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex flex-col items-center">
          <CioLogo size="md" />
          <div className="mt-4">
            <EventDateBadge />
          </div>
        </div>

        {winner ? (
          <div className="rajasthan-card-gold relative mt-10 overflow-hidden rounded-[36px] p-8 sm:p-14 shadow-2xl border-2 border-[#F59E0B]">
            <Sparkles className="absolute left-8 top-8 size-8 text-[#F59E0B]/40" />
            <Sparkles className="absolute bottom-8 right-8 size-10 text-[#D95914]/40" />

            <div className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D95914] text-[#1C0C08] shadow-[0_0_55px_rgba(245,158,11,0.4)]">
              <Trophy className="size-12" />
            </div>

            <span className="mt-6 inline-block rounded-full border border-[#D97706]/50 bg-[#4A1A10] px-4 py-1 text-xs font-black uppercase tracking-[0.28em] text-[#FDE68A]">
              CONCLAVE LUCKY DRAW WINNER
            </span>

            <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight text-white">
              {winner.name}
            </h1>
            <p className="mt-2 text-xl font-bold text-[#F59E0B]">{winner.company}</p>

            <div className="mx-auto mt-6 h-px max-w-xs bg-[#D97706]/30" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#C9A88F]">{winner.prize}</p>
            <p className="mt-1 text-2xl font-bold text-[#FDE68A]">Congratulations!</p>

            <div className="mt-8">
              <a
                href="/leaderboard"
                className="btn-rajasthan-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
              >
                View Conclave Leaderboard <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="rajasthan-card relative mt-10 overflow-hidden rounded-[36px] p-8 sm:p-14 shadow-2xl border border-[#D97706]/30">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#3E150F] border border-[#D97706]/40 text-[#F59E0B]">
              <Trophy className="size-10" />
            </div>
            <span className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.24em] text-[#F59E0B]">
              Conclave Lucky Draw
            </span>
            <h1 className="mt-3 text-3xl font-black text-white">
              {loading ? 'Loading Result…' : 'Draw Awaiting Initiation'}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#C9A88F]">
              The lucky draw winner will be selected from tied top-scoring delegates from the admin console.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="/leaderboard"
                className="btn-rajasthan-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
              >
                View Live Leaderboard <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        )}

        <p className="mt-8 text-xs font-bold text-[#C9A88F]">
          Organized by <strong>CIO Association Rajasthan Chapter</strong> · BFSI 2030
        </p>
      </div>
    </main>
  );
}
