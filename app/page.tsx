'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CioLogo, EventDateBadge } from '@/components/cio-logo';

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [code, setCode] = useState('');
  const [leaders, setLeaders] = useState<{ rank: number; name: string; company: string; score: number }[]>([]);
  const [stats, setStats] = useState({ registered: 0, present: 0, rate: '0%' });
  const [activeSession, setActiveSession] = useState<{ id: string; name: string; sessionNumber: number } | null>(null);

  useEffect(() => {
    const loadData = () => {
      fetch('/api/leaderboard')
        .then((r) => r.json())
        .then((d) => {
          const list = (d.leaderboard ?? []).slice(0, 3).map((item: any, idx: number) => ({
            rank: idx + 1,
            name: item.name,
            company: item.company,
            score: item.totalPoints,
          }));
          setLeaders(list);
        })
        .catch(() => {});

      fetch('/api/live')
        .then((r) => r.json())
        .then((d) => {
          const reg = d.stats?.registered ?? 0;
          const pres = d.stats?.present ?? 0;
          const rate = reg > 0 ? `${Math.round((pres / reg) * 100)}%` : '0%';
          setStats({ registered: reg, present: pres, rate });
          if (d.session) {
            setActiveSession({ id: d.session.id, name: d.session.name, sessionNumber: d.session.sessionNumber });
          }
        })
        .catch(() => {});
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!entered || code.length !== 4 || !activeSession) return;
    const timer = window.setTimeout(() => {
      window.location.href = `/session/${activeSession.id}?code=${code}`;
    }, 350);
    return () => window.clearTimeout(timer);
  }, [code, entered, activeSession]);

  function goToSession() {
    if (!activeSession) return;
    if (code.length === 4) {
      window.location.href = `/session/${activeSession.id}?code=${code}`;
    } else {
      window.location.href = `/session/${activeSession.id}`;
    }
  }

  const sessionLabel = activeSession
    ? `Session ${String(activeSession.sessionNumber).padStart(2, '0')}`
    : 'No Active Session';

  return (
    <main className="rajasthan-backdrop min-h-screen text-[#FFF8F0]">
      {/* Top Header */}
      <nav className="mx-auto flex h-24 max-w-[1400px] items-center justify-between px-5 sm:px-8 border-b border-[#D97706]/20 bg-[#1C0C08]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <CioLogo size="sm" showSubtitle={false} />
          <div className="hidden sm:block border-l border-[#D97706]/30 pl-4">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">BFSI 2030</span>
            <span className="text-[11px] text-[#C9A88F]">Rajasthan Chapter</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="/leaderboard"
            className="rounded-xl border border-[#D97706]/40 bg-[#3D1911]/80 px-4 py-2 text-xs sm:text-sm font-bold tracking-wide text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition shadow-sm flex items-center gap-1.5"
          >
            <Trophy className="size-4 text-[#F59E0B]" />
            Live Leaderboard
          </a>
        </div>
      </nav>

      {/* Hero Section styled like the official poster */}
      <section className="relative mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] items-start">
          
          {/* Left Column: Official Poster Identity */}
          <div className="flex flex-col space-y-6">

            {/* Poster Headline */}
            <div>
              <h1 className="text-[clamp(3.5rem,7.5vw,7.2rem)] font-black leading-[0.88] tracking-tight">
                <span className="text-[#FDE68A] drop-shadow-sm">BFSI</span>{' '}
                <span className="text-saffron-gradient font-extrabold">2030</span>
              </h1>
              <p className="mt-3 text-lg sm:text-2xl font-bold tracking-tight text-[#FCE7D2] max-w-xl">
                Building Intelligent, Inclusive & Compliant Enterprises
              </p>
            </div>

            {/* Date & Venue Badges */}
            <div>
              <EventDateBadge />
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#D97706] uppercase tracking-wider">
              Hosted by CIO Association Rajasthan Chapter
            </p>

          </div>

          {/* Right Column: Delegate Check-in & Session Card */}
          <div className="rajasthan-card-gold rounded-[28px] p-6 sm:p-8 backdrop-blur-xl">
            {!entered ? (
              <>
                {/* Active Session Status Header */}
                <div className="flex items-start justify-between border-b border-[#D97706]/20 pb-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#F59E0B]">
                      {activeSession ? `${sessionLabel} · Live Now` : 'Sessions'}
                    </span>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {activeSession?.name ?? 'Next Session Starting Soon'}
                    </h2>
                  </div>
                  {activeSession && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#BE123C]/20 border border-[#BE123C]/40 px-3 py-1 text-xs font-bold text-[#FCA5A5]">
                      <span className="size-2 rounded-full bg-[#EF4444] animate-ping" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Quick Check-in CTA */}
                <div className="py-6">
                  {activeSession ? (
                    <div className="rounded-2xl border border-[#D95914]/40 bg-[#3E150F]/70 p-5 text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#FCE7D2]">
                        Attendance Code Verification
                      </p>
                      <p className="mt-1 text-sm text-[#C9A88F]">
                        Enter the 4-digit code shown on the auditorium LED screen to record attendance and earn 100 points.
                      </p>
                      <Button
                        onClick={() => setEntered(true)}
                        className="btn-rajasthan-primary mt-4 h-12 w-full rounded-xl text-base"
                      >
                        Enter Session Code <ArrowRight className="size-4 ml-1.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#D97706]/20 bg-[#2D0E08]/40 p-6 text-center">
                      <p className="text-sm font-semibold text-[#FCE7D2]">Sessions will open from the control desk</p>
                      <p className="mt-1 text-xs text-[#C9A88F]">
                        Watch the stage screen for active sessions and check-in codes.
                      </p>
                    </div>
                  )}

                  {/* Leaderboard Mini-view */}
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                        Top Delegate Scores
                      </span>
                      <a href="/leaderboard" className="text-xs font-semibold text-[#FCE7D2] hover:text-[#F59E0B] underline">
                        Full Leaderboard →
                      </a>
                    </div>
                    {leaders.length > 0 ? (
                      <div className="space-y-2.5">
                        {leaders.map((leader) => (
                          <div
                            key={leader.name + leader.rank}
                            className="flex items-center justify-between rounded-xl border border-[#D97706]/20 bg-[#260F0A]/90 px-4 py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`grid size-7 place-items-center rounded-lg text-xs font-black ${
                                  leader.rank === 1
                                    ? 'bg-[#F59E0B] text-[#1C0C08]'
                                    : 'bg-[#4A1A10] text-[#FDE68A]'
                                }`}
                              >
                                {leader.rank}
                              </span>
                              <div>
                                <p className="font-bold text-sm text-white">{leader.name}</p>
                                <p className="text-[11px] text-[#C9A88F]">{leader.company}</p>
                              </div>
                            </div>
                            <strong className="text-base font-black text-[#F59E0B]">{leader.score} pts</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-[#C9A88F]">
                        Scores will update as delegates verify attendance.
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Stats Bar */}
                <div className="grid grid-cols-3 gap-3 border-t border-[#D97706]/20 pt-4 text-center">
                  <div>
                    <strong className="block text-2xl font-black text-[#FDE68A]">{stats.registered}</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A88F]">Delegates</span>
                  </div>
                  <div>
                    <strong className="block text-2xl font-black text-[#F59E0B]">{stats.present}</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A88F]">Attended</span>
                  </div>
                  <div>
                    <strong className="block text-2xl font-black text-[#FDE68A]">{stats.rate}</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A88F]">Rate</span>
                  </div>
                </div>
              </>
            ) : (
              /* Code Entry Step */
              <div className="py-2">
                <button
                  onClick={() => setEntered(false)}
                  className="mb-6 flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] hover:text-[#FDE68A] uppercase tracking-wider"
                >
                  ← Back to Session
                </button>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#F59E0B]">
                  {sessionLabel} · Attendance Verification
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">
                  Enter 4-Digit Code
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#C9A88F]">
                  Check the auditorium LED screen for the rolling 4-digit code.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goToSession();
                  }}
                  className="mt-6"
                >
                  <InputOTP maxLength={4} value={code} onChange={setCode}>
                    <InputOTPGroup className="gap-3 justify-center">
                      {[0, 1, 2, 3].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="size-14 sm:size-16 rounded-2xl border-2 border-[#D97706]/40 bg-[#1C0C08] text-2xl font-black text-[#FDE68A] data-[active=true]:border-[#F59E0B] data-[active=true]:ring-2 data-[active=true]:ring-[#F59E0B]/30"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    type="submit"
                    onClick={goToSession}
                    disabled={code.length !== 4 || !activeSession}
                    className="btn-rajasthan-primary mt-7 h-12 w-full rounded-xl text-base"
                  >
                    Confirm Code & Continue <ChevronRight className="size-4 ml-1" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-[1400px] flex-col gap-3 border-t border-[#D97706]/20 px-5 py-6 text-xs text-[#C9A88F] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>Organized by <strong>CIO Association Rajasthan Chapter</strong> · BFSI 2030</span>
        <div className="flex items-center gap-5">
          <a href="/led" target="_blank" className="hover:text-[#F59E0B] underline">Stage LED Screen</a>
          <a href="/leaderboard" className="hover:text-[#F59E0B] underline">Leaderboard</a>
          <a href="/admin/login" className="hover:text-[#F59E0B] underline">Admin Console</a>
        </div>
      </footer>
    </main>
  );
}
