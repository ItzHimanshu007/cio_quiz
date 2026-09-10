'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Radio, Trophy } from 'lucide-react';
import { CioLogo, EventDateBadge } from '@/components/cio-logo';

export default function LedPage() {
  const [live, setLive] = useState<any>(null);
  const [now, setNow] = useState(0);
  const [sessionUrl, setSessionUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId');
    const apiUrl = sessionId ? `/api/live?sessionId=${encodeURIComponent(sessionId)}` : '/api/live';

    const load = () =>
      fetch(apiUrl)
        .then((r) => r.json())
        .then((d) => {
          setLive(d);
          if (d.session?.id) {
            setSessionUrl(new URL(`/session/${d.session.id}`, window.location.origin).href);
          }
        })
        .catch(() => {});

    load();
    setNow(Date.now() / 1000);
    const poll = setInterval(load, 3000);
    const clock = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, []);

  const s = live?.session;
  const code = live?.code;
  const remaining = Math.max(0, Math.floor((code?.expiresAt || 0) - now));
  const sessionNum = String(s?.sessionNumber || '').padStart(2, '0');

  return (
    <main className="rajasthan-backdrop flex min-h-screen flex-col justify-between p-[3vw] text-[#FFF8F0] select-none">
      {/* Stage Header */}
      <header className="flex items-center justify-between border-b border-[#D97706]/30 pb-4 bg-[#1C0C08]/70 rounded-2xl px-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <CioLogo size="md" />
          <div className="hidden lg:block border-l border-[#D97706]/30 pl-6">
            <h2 className="text-2xl font-black tracking-tight">
              <span className="text-[#FDE68A]">BFSI</span> <span className="text-saffron-gradient font-black">2030</span>
            </h2>
            <p className="text-xs text-[#C9A88F] font-semibold">Building Intelligent, Inclusive & Compliant Enterprises</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <EventDateBadge />
          <div className="flex items-center gap-2 rounded-full border border-[#BE123C]/50 bg-[#BE123C]/20 px-5 py-2 text-base font-extrabold text-[#FCA5A5]">
            <Radio className="size-5 animate-pulse text-[#EF4444]" /> LIVE STAGE
          </div>
        </div>
      </header>

      {/* Main Screen Content: Session Info + Code + QR */}
      <section className="grid items-center gap-[4vw] py-[3vh] lg:grid-cols-[1.2fr_auto]">
        <div className="space-y-6">
          {s ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D97706]/40 bg-[#3E150F] px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em] text-[#FDE68A]">
                Conclave Session {sessionNum}
              </div>
              <h1 className="text-[clamp(3.2rem,6.8vw,6.5rem)] font-black leading-[0.92] tracking-tight text-white drop-shadow-md">
                {s.name}
              </h1>
              {s.speaker && s.speaker !== 'TBD' && (
                <p className="text-[clamp(1.2rem,2.2vw,2rem)] font-semibold text-[#FCE7D2]">
                  Keynote: <span className="text-[#F59E0B] font-bold">{s.speaker}</span>
                </p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#F59E0B]">BFSI 2030 Conclave</span>
              <h1 className="text-[clamp(2.5rem,5vw,5rem)] font-black text-[#C9A88F]">
                Next Session Starting Shortly
              </h1>
              <p className="text-lg text-[#C9A88F]">Please take your seats in the auditorium.</p>
            </div>
          )}

          {/* Session Attendance Code Display */}
          <div className="mt-8 flex flex-wrap items-center gap-8 rounded-3xl border border-[#D97706]/40 bg-[#2A100A]/90 p-8 shadow-2xl backdrop-blur-md">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#F59E0B]">
                SESSION ATTENDANCE CODE
              </p>
              <strong
                className={`mt-2 block font-mono text-[clamp(4.5rem,9vw,8.5rem)] tracking-[0.16em] leading-none ${
                  code?.code ? 'text-[#FDE68A] drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]' : 'text-stone-700'
                }`}
              >
                {code?.code || '----'}
              </strong>
            </div>

            {code?.code && (
              <div className="border-l border-[#D97706]/30 pl-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C9A88F]">Code Expires In</span>
                <strong className={`block text-3xl sm:text-4xl font-mono mt-1 ${remaining < 30 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                  {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
                </strong>
                <span className="text-[11px] text-[#C9A88F] block mt-1">Refreshes every 2 min</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="rajasthan-card-gold rounded-[36px] p-8 text-center shadow-2xl">
          <div className="rounded-2xl bg-white p-5 inline-block shadow-lg">
            {sessionUrl ? (
              <QRCodeSVG
                value={sessionUrl}
                size={280}
                className="h-auto w-[min(20vw,320px)] min-w-[200px]"
                level="H"
                bgColor="#ffffff"
                fgColor="#1C0C08"
                marginSize={1}
              />
            ) : (
              <div className="aspect-square w-[min(20vw,320px)] min-w-[200px] bg-stone-200" />
            )}
          </div>
          <div className="mt-4">
            <p className="text-base sm:text-lg font-black uppercase tracking-[0.2em] text-[#FDE68A]">
              SCAN TO PARTICIPATE
            </p>
            <p className="text-xs font-bold text-[#F59E0B] mt-0.5">
              10 Pts Attendance + 5 Pts Feedback
            </p>
          </div>
        </div>
      </section>

      {/* Stage Footer */}
      <footer className="flex items-center justify-between border-t border-[#D97706]/30 pt-4 text-xs font-bold text-[#C9A88F]">
        <span>Organized by <strong>CIO Association Rajasthan Chapter</strong> · Jaipur</span>
        <a href="/leaderboard" target="_blank" className="flex items-center gap-1.5 text-sm text-[#F59E0B] hover:text-[#FDE68A] uppercase tracking-wider">
          <Trophy className="size-4" /> Live Leaderboard →
        </a>
      </footer>
    </main>
  );
}
