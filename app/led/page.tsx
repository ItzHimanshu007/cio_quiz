'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Building2, Radio, Trophy } from 'lucide-react';

export default function LedPage() {
  const [live, setLive] = useState<any>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const load = () => fetch('/api/live').then((r) => r.json()).then(setLive).catch(() => {});
    load(); setNow(Date.now() / 1000);
    const poll = setInterval(load, 3000);
    const clock = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, []);
  const s = live?.session;
  const code = live?.code;
  const remaining = Math.max(0, Math.floor((code?.expiresAt || 0) - now));
  return (
    <main className="event-grid flex min-h-screen flex-col overflow-hidden bg-[#06111c] px-[4vw] py-[3vh] text-white">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300"><Building2 className="size-7" /></span><div><strong className="block text-2xl tracking-[.14em]">BFSI 2030</strong><span className="text-xs tracking-[.16em] text-slate-500">CIO ASSOCIATION · RAJASTHAN</span></div></div>
        <div className="flex items-center gap-3 rounded-full border border-rose-300/20 bg-rose-300/[.07] px-5 py-2 text-lg font-semibold text-rose-200"><Radio className="size-5" /> LIVE</div>
      </header>
      <section className="grid flex-1 items-center gap-[5vw] py-[5vh] lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xl font-semibold uppercase tracking-[.24em] text-cyan-300">Session {String(s?.sessionNumber || 4).padStart(2, '0')}</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(3.5rem,7.2vw,8rem)] font-semibold leading-[.92] tracking-[-.055em]">{s?.name || 'Digital Transformation in BFSI'}</h1>
          <p className="mt-6 text-[clamp(1.2rem,2.2vw,2.2rem)] text-slate-400">{s?.speaker || 'Priya Mehta · FutureBank Labs'}</p>
          <div className="mt-[7vh] flex items-center gap-8"><div><p className="text-xl uppercase tracking-[.2em] text-slate-500">Session code</p><strong className="mt-2 block font-mono text-[clamp(4.5rem,10vw,10rem)] tracking-[.14em] text-cyan-300">{code?.code || '----'}</strong></div><div className="border-l border-white/10 pl-8"><span className="text-slate-500">Valid for</span><strong className="block text-3xl">00:{String(remaining).padStart(2, '0')}</strong></div></div>
        </div>
        <div className="rounded-[36px] border border-white/10 bg-white p-7 shadow-[0_0_80px_rgba(103,232,215,.12)]">
          <QRCodeSVG value="https://event-domain.com/attend/session-04" size={300} className="h-auto w-[min(22vw,360px)] min-w-[220px]" level="H" bgColor="#ffffff" fgColor="#07131f" marginSize={1} />
          <p className="mt-5 text-center text-lg font-bold uppercase tracking-[.16em] text-[#07131f]">Scan to participate</p>
        </div>
      </section>
      <footer className="flex items-center justify-between border-t border-white/[.08] pt-5 text-slate-500"><span className="text-lg">Connect. Participate. Lead.</span><a href="/leaderboard" className="flex items-center gap-2 text-lg text-cyan-300"><Trophy className="size-5" /> Live leaderboard</a></footer>
    </main>
  );
}
