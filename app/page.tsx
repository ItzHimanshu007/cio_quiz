'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronRight, Radio, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const leaders = [
  { rank: 1, name: 'Rahul Sharma', company: 'ABC Bank', score: 185 },
  { rank: 2, name: 'Amit Jain', company: 'XYZ Finance', score: 180 },
  { rank: 3, name: 'Neha Gupta', company: 'PQR Insurance', score: 175 },
];

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [code, setCode] = useState('');
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name:'start_session_check_in', title:'Start session check-in', description:'Open the BFSI 2030 Session 04 attendance flow so the participant can register and enter the current code.', inputSchema:{type:'object',properties:{},additionalProperties:false}, annotations:{readOnlyHint:false,untrustedContentHint:false}, execute(){ window.location.href='/attend/session-04'; return {status:'opened',sessionId:'session-04'}; } },{signal:lifecycle.signal})).catch(()=>{});
    void Promise.resolve(context.registerTool({ name:'read_live_leaderboard', title:'Read live leaderboard', description:'Read the current public BFSI 2030 rankings without exposing participant contact details.', inputSchema:{type:'object',properties:{},additionalProperties:false}, annotations:{readOnlyHint:true,untrustedContentHint:true}, async execute(){ const response=await fetch('/api/leaderboard'); const data=await response.json(); return {leaderboard:data.leaderboard??[]}; } },{signal:lifecycle.signal})).catch(()=>{});
    return () => lifecycle.abort();
  }, []);
  useEffect(() => {
    if (!entered || code.length !== 4) return;
    const timer = window.setTimeout(() => { window.location.href = '/attend/session-04'; }, 350);
    return () => window.clearTimeout(timer);
  }, [code, entered]);
  return (
    <main className="min-h-screen bg-[#07131f] text-white">
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3" aria-label="BFSI 2030 home">
          <span className="grid size-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><Building2 className="size-5" /></span>
          <span><strong className="block font-heading text-[1.05rem] tracking-[0.12em]">BFSI 2030</strong><span className="hidden text-[0.68rem] tracking-wide text-slate-400 sm:block">CIO ASSOCIATION · RAJASTHAN</span></span>
        </a>
        <div className="flex items-center gap-2 sm:gap-5"><a href="/leaderboard" className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block">Leaderboard</a><a href="/admin" className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-white">Admin portal</a></div>
      </nav>
      <section className="relative overflow-hidden border-y border-white/[0.06]">
        <div className="event-grid absolute inset-0 opacity-50" /><div className="orb orb-one" /><div className="orb orb-two" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.08fr_.92fr] lg:px-12 lg:py-20">
          <div className="flex max-w-2xl flex-col justify-center">
            <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300"><Radio className="size-3.5" /> LIVE EVENT · JAIPUR</div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Banking · Finance · Insurance</p>
            <h1 className="font-heading text-[clamp(3.4rem,8vw,7.7rem)] font-semibold leading-[0.84] tracking-[-0.075em]">BFSI <span className="text-gradient">2030</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">Connect. Participate. Lead. Join every session, share your perspective and rise through the live rankings.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button onClick={() => setEntered(true)} className="h-12 rounded-full bg-cyan-300 px-6 text-[0.95rem] font-bold text-[#07131f] shadow-[0_0_32px_rgba(94,234,212,.18)] hover:bg-cyan-200">Enter event <ArrowRight className="size-4" /></Button>
              <div className="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck className="size-4 text-emerald-300" /> Secure session verification</div>
            </div>
          </div>
          <div className="relative lg:pl-8">
            <div className="panel-glow rounded-[28px] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              {!entered ? (<>
                <div className="flex items-start justify-between border-b border-white/[0.08] pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Now live · Session 04</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Digital transformation in BFSI</h2></div><span className="mt-1 flex items-center gap-2 rounded-full bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-300"><span className="size-1.5 animate-pulse rounded-full bg-rose-300" /> LIVE</span></div>
                <div className="py-6"><div className="mb-5 flex items-center justify-between"><p className="text-sm font-medium text-slate-300">Live leaderboard</p><span className="text-xs text-slate-500">Updated now</span></div><div className="space-y-3">{leaders.map((leader) => <div key={leader.rank} className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0b1b2a]/80 p-3.5 transition hover:border-cyan-300/20"><span className={`grid size-9 place-items-center rounded-xl text-sm font-bold ${leader.rank === 1 ? 'bg-amber-300 text-[#201600]' : 'bg-white/[0.06] text-slate-300'}`}>{leader.rank}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-100">{leader.name}</p><p className="truncate text-xs text-slate-500">{leader.company}</p></div><strong className="font-heading text-xl text-cyan-300">{leader.score}</strong></div>)}</div></div>
                <div className="grid grid-cols-3 gap-3 border-t border-white/[0.08] pt-5">{[['387','Registered'],['312','Present'],['80.6%','Attendance']].map(([value,label]) => <div key={label}><strong className="block font-heading text-xl sm:text-2xl">{value}</strong><span className="text-[0.7rem] text-slate-500 sm:text-xs">{label}</span></div>)}</div>
              </>) : (
                <div className="px-1 py-2 sm:px-3"><button onClick={() => setEntered(false)} className="mb-8 text-sm text-slate-400 hover:text-white">← Back</button><div className="mb-7 grid size-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300"><Sparkles className="size-5" /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Session 04 · Attendance</p><h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Enter the code on screen</h2><p className="mt-3 text-sm leading-6 text-slate-400">Your four-digit code confirms you’re in the room. It refreshes every 60 seconds.</p><InputOTP maxLength={4} value={code} onChange={setCode} containerClassName="mt-8"><InputOTPGroup className="gap-3">{[0,1,2,3].map((index) => <InputOTPSlot key={index} index={index} className="size-14 rounded-xl border border-white/10 bg-white/[0.06] text-xl font-bold text-white first:rounded-xl first:border last:rounded-xl data-[active=true]:border-cyan-300 data-[active=true]:ring-cyan-300/20 sm:size-16" />)}</InputOTPGroup></InputOTP><Button disabled={code.length !== 4} className="mt-8 h-12 w-full rounded-xl bg-cyan-300 font-bold text-[#07131f] hover:bg-cyan-200">Verify attendance <ChevronRight /></Button><div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"><CheckCircle2 className="size-3.5" /> Attendance takes less than 15 seconds</div></div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between px-2 text-xs text-slate-500"><span>SESSION SCORE</span><span className="flex items-center gap-1.5"><Trophy className="size-3.5 text-amber-300" /> Up to 25 points</span></div>
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>Organized by CIO Association Rajasthan Chapter</span><span>Attendance · Feedback · Quiz · Rewards</span></footer>
    </main>
  );
}
