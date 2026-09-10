'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CircleUserRound,
  Clock3,
  Download,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Loader2,
  PanelLeft,
  Play,
  Radio,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SquareCheckBig,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CioLogo } from '@/components/cio-logo';

const nav = [
  ['dashboard', 'Overview', LayoutDashboard],
  ['sessions', 'Sessions', ListChecks],
  ['participants', 'Delegates', Users],
  ['leaderboard', 'Leaderboard', Trophy],
  ['draws', 'Lucky Draw', RefreshCw],
  ['analytics', 'Analytics', BarChart3],
  ['settings', 'Settings', Settings],
] as const;

export default function AdminDashboard({ section = 'dashboard', adminName }: { section?: string; adminName: string }) {
  const [mobile, setMobile] = useState(false);
  const [overview, setOverview] = useState<any>({ registered: 0, present: 0, feedback: 0, leader: null, ties: 0, activeSession: null });

  const loadOverview = useCallback(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => !d.error && setOverview(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOverview();
    const poll = setInterval(loadOverview, 5000);
    return () => clearInterval(poll);
  }, [loadOverview]);

  return (
    <main className="min-h-screen bg-[#160805] text-[#FFF8F0]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#D97706]/20 bg-[#1E0C08] p-5 transition lg:translate-x-0 ${
          mobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CioLogo size="sm" showSubtitle={false} />
          </div>
          <button className="lg:hidden text-[#C9A88F]" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D97706]">
          ADMIN CONTROL DESK
        </p>

        <nav className="mt-8 space-y-1">
          {nav.map(([id, label, Icon]) => (
            <a
              key={id}
              href={`/admin/${id}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                section === id
                  ? 'bg-[#D95914]/20 text-[#FDE68A] border border-[#D97706]/40'
                  : 'text-[#C9A88F] hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon className={`size-4 ${section === id ? 'text-[#F59E0B]' : ''}`} />
              {label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-[#D97706]/20 bg-[#2A100A] p-3">
          <div className="flex items-center gap-2.5">
            <CircleUserRound className="size-5 text-[#F59E0B]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{adminName || 'Admin'}</p>
              <p className="text-[10px] text-[#F59E0B]">Conclave Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D97706]/20 bg-[#160805]/95 px-5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-[#C9A88F]" onClick={() => setMobile(true)}>
              <PanelLeft />
            </button>
            <div>
              <p className="text-xs text-[#C9A88F]">BFSI 2030 Conclave / Jaipur</p>
              <h1 className="text-lg font-bold capitalize text-white">
                {section === 'dashboard' ? 'Conclave Operations' : section}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-[#BE123C]/20 border border-[#BE123C]/40 px-3 py-1 text-xs font-bold text-[#FCA5A5] sm:flex">
              <Radio className="size-3 text-[#EF4444] animate-pulse" /> Conclave Active
            </span>
            <a
              href="/led"
              target="_blank"
              className="rounded-lg border border-[#D97706]/30 bg-[#2A100A] px-3 py-1.5 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
            >
              Open Stage LED
            </a>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          {section === 'dashboard' && <Dashboard overview={overview} />}
          {section === 'sessions' && <Sessions activeSession={overview.activeSession} onRefresh={loadOverview} />}
          {section === 'participants' && <Participants />}
          {section === 'leaderboard' && <AdminLeaderboard />}
          {section === 'draws' && <Draws overview={overview} />}
          {section === 'analytics' && <Analytics />}
          {section === 'settings' && <SettingsPanel />}
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────── */
function Dashboard({ overview: o }: { overview: any }) {
  const cards = [
    ['Registered Delegates', o.registered, Users, `${o.registered} total checked in`],
    ['Session Attendance', o.present, Activity, o.activeSession ? `Session ${String(o.activeSession?.sessionNumber).padStart(2,'0')} live` : 'No active session'],
    ['Feedback Responses', o.feedback, ListChecks, `${o.feedback} submissions recorded`],
    ['Top Score Ties', o.ties > 1 ? o.ties : '—', AlertTriangle, o.ties > 1 ? `${o.ties} delegates tied for Rank #1` : 'Clear top leader'],
  ];

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Conclave Overview</p>
          <h2 className="mt-1 text-3xl font-black text-white">Event Operations</h2>
        </div>
        {o.activeSession ? (
          <span className="w-fit rounded-full border border-[#BE123C]/40 bg-[#BE123C]/20 px-3.5 py-1.5 text-xs font-bold text-[#FCA5A5]">
            SESSION {String(o.activeSession?.sessionNumber || '').padStart(2, '0')} · LIVE NOW
          </span>
        ) : (
          <span className="w-fit rounded-full border border-[#D97706]/30 bg-[#2A100A] px-3.5 py-1.5 text-xs font-bold text-[#C9A88F]">
            NO ACTIVE SESSION
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, note]: any) => (
          <div key={label} className="rajasthan-card rounded-2xl p-5 border border-[#D97706]/20">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A88F]">{label}</span>
              <Icon className="size-4 text-[#F59E0B]" />
            </div>
            <strong className="mt-4 block text-3xl font-black text-[#FDE68A]">{value}</strong>
            <span className="mt-1 block text-xs text-[#C9A88F]">{note}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="rajasthan-card-gold rounded-2xl p-6 border border-[#D97706]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">Active Session</p>
              <h3 className="mt-1 text-xl font-bold text-white">
                {o.activeSession ? `Session ${String(o.activeSession?.sessionNumber).padStart(2,'0')}: ${o.activeSession?.name}` : 'No session currently in progress'}
              </h3>
            </div>
            {o.activeSession && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
                <Radio className="size-3 animate-pulse" /> Live Now
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/admin/sessions" className="btn-rajasthan-primary rounded-xl px-4 py-2 text-xs font-bold">
              Manage Sessions
            </a>
            <a href="/led" target="_blank" className="rounded-xl border border-[#D97706]/40 bg-[#2A100A] px-4 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition">
              Open Stage Display
            </a>
            <a href="/leaderboard" target="_blank" className="rounded-xl border border-[#D97706]/40 bg-[#2A100A] px-4 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition">
              Live Leaderboard
            </a>
          </div>
        </div>

        <div className="rajasthan-card rounded-2xl p-6 border border-[#D97706]/20">
          <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Conclave Leader</p>
          <div className="mt-4 grid size-12 place-items-center rounded-xl bg-[#F59E0B] text-[#1C0C08]">
            <Trophy className="size-6" />
          </div>
          <h3 className="mt-4 text-xl font-black text-white">{o.leader?.points > 0 ? o.leader.name : 'Awaiting Scores'}</h3>
          <p className="mt-1 text-sm font-bold text-[#F59E0B]">{o.leader?.points > 0 ? `${o.leader.points} points recorded` : '0 points recorded'}</p>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   SESSIONS
───────────────────────────────────────── */
function Sessions({ activeSession, onRefresh }: { activeSession: any; onRefresh: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [codes, setCodes] = useState<Record<string, { code: string; expiresAt: number }>>({});
  const [clock, setClock] = useState(Date.now() / 1000);
  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const [expandedAnalytics, setExpandedAnalytics] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', sessionNumber: '', speaker: '', startTime: '10:00 AM', endTime: '11:00 AM', status: 'UPCOMING' });
  const [createError, setCreateError] = useState('');

  const loadSessions = useCallback(() => {
    fetch('/api/admin/sessions')
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSessions();
    const timer = setInterval(() => setClock(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, [loadSessions]);

  async function openAttendance(sessionId: string) {
    setBusy(sessionId + ':open');
    await fetch('/api/admin/session-control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, action: 'open_attendance' }),
    });
    setBusy(null);
    loadSessions();
    onRefresh();
    generateCode(sessionId);
  }

  async function closeAttendance(sessionId: string) {
    setBusy(sessionId + ':close');
    await fetch('/api/admin/session-control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, action: 'close_attendance' }),
    });
    setBusy(null);
    loadSessions();
    onRefresh();
  }

  async function generateCode(sessionId: string) {
    setBusy(sessionId + ':code');
    const r = await fetch('/api/admin/code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const d = await r.json();
    setBusy(null);
    if (r.ok) {
      setCodes((prev) => ({ ...prev, [sessionId]: { code: d.code, expiresAt: d.expiresAt } }));
    }
  }

  async function loadAnalytics(sessionId: string) {
    if (expandedAnalytics === sessionId) { setExpandedAnalytics(null); return; }
    const r = await fetch(`/api/admin/analytics?sessionId=${encodeURIComponent(sessionId)}`);
    const d = await r.json();
    if (r.ok) setAnalytics((prev) => ({ ...prev, [sessionId]: d.analytics }));
    setExpandedAnalytics(sessionId);
  }

  async function createSession() {
    setCreateError('');
    const num = parseInt(newSession.sessionNumber);
    if (!newSession.name || !num) { setCreateError('Session name and number are required.'); return; }
    setBusy('create');
    const r = await fetch('/api/admin/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: newSession.name,
        sessionNumber: num,
        speaker: newSession.speaker,
        status: newSession.status,
      }),
    });
    const d = await r.json();
    setBusy(null);
    if (!r.ok) { setCreateError(d.error); return; }
    setShowCreate(false);
    setNewSession({ name: '', sessionNumber: '', speaker: '', startTime: '10:00 AM', endTime: '11:00 AM', status: 'UPCOMING' });
    loadSessions();
    onRefresh();
  }

  const statusColor = (s: string) =>
    s === 'LIVE' ? 'text-[#FDE68A] bg-[#BE123C]/30 border-[#BE123C]'
    : s === 'COMPLETED' ? 'text-[#C9A88F] bg-stone-900/60 border-stone-800'
    : 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Conclave Agenda</p>
          <h2 className="mt-1 text-3xl font-black text-white">Session Management</h2>
        </div>
        <Button onClick={() => setShowCreate(true)} className="btn-rajasthan-primary h-10 px-5">
          + Create Session
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 rajasthan-card-gold rounded-2xl p-5 border border-[#D97706]/40">
          <h3 className="mb-4 font-bold text-lg text-[#FDE68A]">New Conclave Session</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#C9A88F]">Session Number *</span>
              <Input
                type="number"
                min={1}
                value={newSession.sessionNumber}
                onChange={(e) => setNewSession((p) => ({ ...p, sessionNumber: e.target.value }))}
                placeholder="e.g. 1"
                className="h-10 bg-[#1C0C08] border-[#D97706]/30 text-white"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold text-[#C9A88F]">Session Name *</span>
              <Input
                value={newSession.name}
                onChange={(e) => setNewSession((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Digital Transformation in BFSI"
                className="h-10 bg-[#1C0C08] border-[#D97706]/30 text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#C9A88F]">Start Time</span>
              <Input
                value={newSession.startTime}
                onChange={(e) => setNewSession((p) => ({ ...p, startTime: e.target.value }))}
                placeholder="10:00 AM"
                className="h-10 bg-[#1C0C08] border-[#D97706]/30 text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#C9A88F]">End Time</span>
              <Input
                value={newSession.endTime}
                onChange={(e) => setNewSession((p) => ({ ...p, endTime: e.target.value }))}
                placeholder="11:00 AM"
                className="h-10 bg-[#1C0C08] border-[#D97706]/30 text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#C9A88F]">Initial Status</span>
              <select
                value={newSession.status}
                onChange={(e) => setNewSession((p) => ({ ...p, status: e.target.value }))}
                className="h-10 w-full rounded-md border border-[#D97706]/30 bg-[#1C0C08] px-3 py-2 text-sm text-white"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
            <label className="block sm:col-span-3">
              <span className="mb-1 block text-xs font-bold text-[#C9A88F]">Keynote / Speaker (Optional)</span>
              <Input
                value={newSession.speaker}
                onChange={(e) => setNewSession((p) => ({ ...p, speaker: e.target.value }))}
                placeholder="e.g. Priya Mehta, FutureBank Labs"
                className="h-10 bg-[#1C0C08] border-[#D97706]/30 text-white"
              />
            </label>
          </div>
          {createError && <p className="mt-3 text-sm text-[#EF4444] font-bold">{createError}</p>}
          <div className="mt-5 flex gap-3">
            <Button onClick={createSession} disabled={busy === 'create'} className="btn-rajasthan-primary h-9 text-xs">
              {busy === 'create' ? <Loader2 className="animate-spin" /> : 'Save Session'}
            </Button>
            <Button variant="outline" onClick={() => { setShowCreate(false); setCreateError(''); }} className="h-9 text-xs border-white/20">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-8 animate-spin text-[#F59E0B]" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D97706]/30 p-12 text-center text-[#C9A88F]">
          No sessions recorded yet. Click "+ Create Session" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s: any) => {
            const sessionCode = codes[s.id];
            const remaining = sessionCode ? Math.max(0, Math.floor(sessionCode.expiresAt - clock)) : 0;
            const isActive = s.status === 'LIVE';
            const isBusy = (k: string) => busy === `${s.id}:${k}`;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 transition ${
                  isActive
                    ? 'rajasthan-card-gold border-[#F59E0B]'
                    : 'rajasthan-card border-[#D97706]/20'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#F59E0B]">
                        SESSION {String(s.sessionNumber).padStart(2, '0')}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-xl font-bold text-white">{s.name}</h3>
                    {s.speaker && s.speaker !== 'TBD' && (
                      <p className="text-xs font-semibold text-[#C9A88F] mt-0.5">Speaker: {s.speaker}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(s.status === 'UPCOMING' || s.status === 'COMPLETED') && (
                      <button
                        onClick={() => openAttendance(s.id)}
                        disabled={!!busy}
                        className="btn-rajasthan-gold flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"
                      >
                        {isBusy('open') ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />}
                        {s.status === 'COMPLETED' ? 'Make Live' : 'Open Attendance (Make Live)'}
                      </button>
                    )}
                    {s.status === 'LIVE' && (
                      <>
                        <button
                          onClick={() => generateCode(s.id)}
                          disabled={!!busy}
                          className="btn-rajasthan-gold flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"
                        >
                          {isBusy('code') ? <Loader2 className="size-3 animate-spin" /> : <KeyRound className="size-3" />}
                          Generate Code
                        </button>
                        <button
                          onClick={() => closeAttendance(s.id)}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 rounded-lg border border-[#BE123C]/50 bg-[#BE123C]/20 px-3 py-2 text-xs font-bold text-[#FCA5A5] hover:bg-[#BE123C]/40"
                        >
                          {isBusy('close') ? <Loader2 className="size-3 animate-spin" /> : <SquareCheckBig className="size-3" />}
                          Close Attendance
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => loadAnalytics(s.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#D97706]/30 bg-[#1C0C08] px-3 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
                    >
                      <BarChart3 className="size-3" />
                      {expandedAnalytics === s.id ? 'Hide Analytics' : 'Session Stats'}
                    </button>
                  </div>
                </div>

                {s.status === 'LIVE' && (
                  <div className="mt-4 flex items-center gap-6 rounded-2xl border border-[#D97706]/40 bg-[#1C0C08] px-6 py-3.5">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">CURRENT 60S CODE</p>
                      <strong className="font-mono text-4xl tracking-[0.25em] text-[#FDE68A]">
                        {sessionCode?.code ?? '----'}
                      </strong>
                    </div>
                    {sessionCode && (
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A88F]">EXPIRES IN</p>
                        <div className="flex items-center gap-1.5 text-[#F59E0B]">
                          <Clock3 className="size-4" />
                          <strong className="font-mono text-xl">
                            00:{String(remaining).padStart(2, '0')}
                          </strong>
                        </div>
                      </div>
                    )}
                    {!sessionCode && (
                      <p className="text-xs text-[#C9A88F]">Click "Generate Code" to display code on stage screen.</p>
                    )}
                  </div>
                )}

                {expandedAnalytics === s.id && analytics[s.id] && (
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[#D97706]/20 bg-[#1C0C08]/90 p-4 sm:grid-cols-4">
                    {[
                      ['Total Attendance', analytics[s.id].totalAttendance],
                      ['Feedback Submitted', analytics[s.id].feedbackSubmitted],
                      ['Avg Rating', analytics[s.id].averageRating ? `${analytics[s.id].averageRating} ★` : '—'],
                      ['Points Awarded', analytics[s.id].totalPointsAwarded],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-[11px] font-bold text-[#C9A88F] uppercase">{label}</p>
                        <strong className="mt-1 block text-2xl font-black text-[#FDE68A]">{value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   PARTICIPANTS (DELEGATES)
───────────────────────────────────────── */
function Participants() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/participants?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setList(d.participants || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [q]);

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-3xl font-black text-white">Delegates</h2>
          <p className="mt-1 text-xs text-[#C9A88F]">All registered attendees with mobile numbers and scores.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 size-4 text-[#C9A88F]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, mobile, company…"
            className="h-10 w-full bg-[#1C0C08] border-[#D97706]/30 text-white pl-10 sm:w-72"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#D97706]/20 rajasthan-card">
        <div className="grid grid-cols-[1fr_90px] bg-[#1C0C08] px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#F59E0B] sm:grid-cols-[1.2fr_1fr_120px_80px]">
          <span>Delegate</span>
          <span className="hidden sm:block">Company</span>
          <span className="hidden sm:block">Mobile</span>
          <span className="text-right">Points</span>
        </div>
        {list.length > 0 ? (
          list.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_90px] items-center border-t border-[#D97706]/10 px-5 py-3.5 sm:grid-cols-[1.2fr_1fr_120px_80px]">
              <div>
                <p className="font-bold text-sm text-white">{p.fullName}</p>
                <p className="text-xs text-[#C9A88F] sm:hidden">{p.company}</p>
              </div>
              <span className="hidden text-xs text-[#C9A88F] sm:block">{p.company}</span>
              <span className="hidden font-mono text-xs text-[#FDE68A] sm:block">{p.mobile}</span>
              <strong className="text-right text-base font-black text-[#F59E0B]">{p.totalPoints ?? 0}</strong>
            </div>
          ))
        ) : (
          <div className="border-t border-[#D97706]/10 p-10 text-center text-sm text-[#C9A88F]">
            {loading ? 'Loading delegates…' : 'No delegates registered yet.'}
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   ADMIN LEADERBOARD
───────────────────────────────────────── */
function AdminLeaderboard() {
  const [data, setData] = useState<{ leaderboard: any[]; tieDetection: any } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch('/api/admin/leaderboard')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const lb = data?.leaderboard ?? [];
  const tie = data?.tieDetection;

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Official Conclave Rankings</p>
          <h2 className="mt-1 text-3xl font-black text-white">Leaderboard Console</h2>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-[#D97706]/30 bg-[#1C0C08] px-3.5 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      {tie?.isTie && (
        <div className="mb-6 rajasthan-card-gold rounded-2xl p-5 border-2 border-[#F59E0B]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-[#F59E0B]" />
            <strong className="text-sm font-black uppercase tracking-wider text-[#FDE68A]">
              TIE DETECTED — {tie.tiedCount} PARTICIPANTS AT {tie.maxPoints} POINTS
            </strong>
          </div>
          <p className="mt-1 text-xs text-[#C9A88F]">
            Multiple delegates share the highest score. Use the links below to export data or run the tie-breaker draw.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tie.tiedParticipants.map((p: any) => (
              <span key={p.id} className="rounded-lg border border-[#D97706]/40 bg-[#1C0C08] px-3 py-1 text-xs font-bold text-[#FDE68A]">
                {p.name} · {p.company} ({p.totalPoints} pts)
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/api/admin/export?format=csv"
              className="flex items-center gap-1.5 rounded-lg border border-[#D97706]/40 bg-[#1C0C08] px-3 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
            >
              <Download className="size-3.5" /> Export Tie CSV
            </a>
            <a
              href="/api/admin/export?format=xlsx"
              className="flex items-center gap-1.5 rounded-lg border border-[#D97706]/40 bg-[#1C0C08] px-3 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
            >
              <Download className="size-3.5" /> Export Tie XLSX
            </a>
            <a
              href="/admin/draws"
              className="btn-rajasthan-primary flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs"
            >
              <Trophy className="size-3.5" /> Start Lucky Draw
            </a>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#D97706]/20 rajasthan-card">
        <div className="grid grid-cols-[48px_1fr_110px_80px] bg-[#1C0C08] px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#F59E0B] lg:grid-cols-[48px_1.5fr_1fr_120px_80px_80px]">
          <span>Rank</span>
          <span>Delegate</span>
          <span className="hidden lg:block">Company</span>
          <span>Mobile</span>
          <span className="hidden lg:block text-center">Sessions</span>
          <span className="text-right">Points</span>
        </div>
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="size-7 animate-spin text-[#F59E0B]" />
          </div>
        ) : lb.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#C9A88F]">No scored delegates yet.</div>
        ) : (
          lb.map((p: any, i: number) => {
            const isTop = tie?.isTie && p.totalPoints === tie.maxPoints;
            return (
              <div
                key={p.id}
                className={`grid grid-cols-[48px_1fr_110px_80px] items-center border-t border-[#D97706]/10 px-5 py-3 lg:grid-cols-[48px_1.5fr_1fr_120px_80px_80px] ${
                  isTop ? 'bg-[#F59E0B]/10' : ''
                }`}
              >
                <span
                  className={`grid size-8 place-items-center rounded-lg text-xs font-black ${
                    i === 0 ? 'bg-[#F59E0B] text-[#1C0C08]' : 'bg-[#3E150F] text-[#FDE68A]'
                  }`}
                >
                  {i === 0 ? <Trophy className="size-4" /> : i + 1}
                </span>
                <div>
                  <p className="font-bold text-sm text-white">{p.name}</p>
                  <p className="text-[11px] text-[#C9A88F] lg:hidden">{p.company}</p>
                </div>
                <span className="hidden text-xs text-[#C9A88F] lg:block">{p.company}</span>
                <span className="font-mono text-xs text-[#FDE68A]">{p.mobile}</span>
                <span className="hidden text-center text-xs font-bold text-white lg:block">{p.sessionsAttended}</span>
                <strong className={`text-right text-base font-black ${isTop ? 'text-[#F59E0B]' : 'text-white'}`}>
                  {p.totalPoints}
                </strong>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   DRAWS
───────────────────────────────────────── */
function Draws({ overview }: { overview: any }) {
  const [draw, setDraw] = useState<any>(null);
  const [drawError, setDrawError] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'done'>('idle');
  const [tieData, setTieData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadTie = useCallback(() => {
    fetch('/api/admin/leaderboard')
      .then((r) => r.json())
      .then((d) => setTieData(d.tieDetection))
      .catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    fetch('/api/admin/draw')
      .then((r) => r.json())
      .then((d) => setHistory(d.draws || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTie();
    loadHistory();
  }, [loadTie, loadHistory]);

  async function startDraw() {
    setBusy(true);
    setDrawError('');
    setPhase('drawing');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const r = await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prize: 'BFSI 2030 Conclave Gift Award' }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setDrawError(d.error); setPhase('idle'); return; }
    setDraw(d.draw);
    setPhase('done');
    loadHistory();
  }

  const isTie = tieData?.isTie;

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Conclave Award Resolution</p>
          <h2 className="mt-1 text-3xl font-black text-white">Lucky Draw</h2>
        </div>
        <button
          onClick={() => { loadTie(); loadHistory(); }}
          className="flex items-center gap-2 rounded-xl border border-[#D97706]/30 bg-[#1C0C08] px-3.5 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          {isTie ? (
            <div className="rajasthan-card-gold rounded-2xl p-6 border-2 border-[#F59E0B]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-[#F59E0B]" />
                <p className="text-xs font-black uppercase tracking-wider text-[#FDE68A]">
                  TIE DETECTED — {tieData.tiedCount} PARTICIPANTS
                </p>
              </div>
              <h3 className="mt-2 text-2xl font-black text-white">
                {tieData.tiedCount} Finalists at {tieData.maxPoints} Points
              </h3>

              <div className="mt-4 space-y-2">
                {tieData.tiedParticipants.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-[#D97706]/20 bg-[#1C0C08] px-4 py-3">
                    <div>
                      <p className="font-bold text-sm text-white">{p.name}</p>
                      <p className="text-xs text-[#C9A88F]">{p.company}</p>
                    </div>
                    <strong className="text-[#F59E0B] font-bold">{p.totalPoints} pts</strong>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/api/admin/export?format=csv"
                  className="flex items-center gap-1.5 rounded-lg border border-[#D97706]/40 bg-[#1C0C08] px-3 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
                >
                  <Download className="size-3.5" /> Export Tie CSV
                </a>
                <a
                  href="/api/admin/export?format=xlsx"
                  className="flex items-center gap-1.5 rounded-lg border border-[#D97706]/40 bg-[#1C0C08] px-3 py-2 text-xs font-bold text-[#FDE68A] hover:bg-[#D95914] hover:text-white transition"
                >
                  <Download className="size-3.5" /> Export Tie XLSX
                </a>
              </div>

              {phase === 'idle' && (
                <div className="mt-6">
                  <Button onClick={startDraw} disabled={busy} className="btn-rajasthan-primary h-11 px-6 text-sm">
                    <Trophy className="size-4 mr-2" /> Start Lucky Draw
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rajasthan-card rounded-2xl p-6 border border-[#D97706]/20">
              <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">No Active Tie</p>
              <h3 className="mt-2 text-xl font-bold text-white">Lucky draw is activated when highest score is tied</h3>
              <p className="mt-1 text-xs text-[#C9A88F]">
                When two or more participants share the top score, the tie-breaker draw panel will activate here.
              </p>
            </div>
          )}

          {phase === 'drawing' && (
            <div className="mt-5 rajasthan-card-gold rounded-2xl p-8 text-center border border-[#F59E0B]">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#F59E0B]">LUCKY DRAW</p>
              <p className="mt-2 text-xl font-bold text-white">{tieData?.tiedCount || 2} FINALISTS</p>
              <Loader2 className="mx-auto mt-6 size-10 animate-spin text-[#F59E0B]" />
              <p className="mt-4 text-xl font-black tracking-widest text-[#FDE68A]">DRAWING…</p>
              <p className="mt-1 text-xs text-[#C9A88F]">Selecting winner randomly from tied finalists</p>
            </div>
          )}

          {phase === 'done' && draw && (
            <div className="mt-5 rajasthan-card-gold rounded-2xl p-8 text-center border-2 border-[#F59E0B]">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#F59E0B] text-[#1C0C08]">
                <Trophy className="size-8" />
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-[#F59E0B]">LUCKY DRAW</p>
              <p className="text-xs font-bold uppercase tracking-wider text-[#FDE68A] mt-1">WINNER</p>
              <strong className="mt-2 block text-3xl font-black text-white">{draw.winner.name}</strong>
              <p className="mt-1 text-lg font-bold text-[#F59E0B]">{draw.winner.company}</p>
              <div className="mt-4 text-xs text-[#C9A88F]">
                Selected from {draw.finalists.length} tied finalists · {draw.winner.points} points
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={startDraw} disabled={busy} variant="outline" className="h-9 text-xs border-white/20">
                  Draw Again
                </Button>
                <a
                  href="/winner"
                  target="_blank"
                  className="btn-rajasthan-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold"
                >
                  View Public Winner Page
                </a>
              </div>
            </div>
          )}

          {drawError && <p className="mt-4 text-sm text-[#EF4444] font-bold">{drawError}</p>}
        </div>

        <div>
          <div className="rajasthan-card rounded-2xl p-5 border border-[#D97706]/20">
            <h3 className="font-bold text-white">Draw Records</h3>
            <p className="mt-0.5 text-xs text-[#C9A88F]">Persisted lucky draw results history.</p>

            <div className="mt-4 space-y-3">
              {history.length > 0 ? (
                history.map((h: any) => (
                  <div key={h.id} className="rounded-xl border border-[#D97706]/20 bg-[#1C0C08] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#FDE68A]">{h.winnerName || 'Winner Selected'}</strong>
                      <span className="text-[#C9A88F]">
                        {h.completedAt ? new Date(h.completedAt * 1000).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[#C9A88F]">{h.winnerCompany}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[11px] text-[#C9A88F]">
                      <span className="truncate font-mono">ID: {h.id.slice(0, 8)}…</span>
                      <span className="font-bold text-[#F59E0B]">{h.points ? `${h.points} pts` : 'Completed'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-[#C9A88F]">No draw records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   ANALYTICS
───────────────────────────────────────── */
function Analytics() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/sessions')
      .then((r) => r.json())
      .then((d) => {
        const list = d.sessions || [];
        setSessions(list);
        if (list.length > 0) setSelected(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/admin/analytics?sessionId=${encodeURIComponent(selected)}`)
      .then((r) => r.json())
      .then((d) => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selected]);

  const a = analytics?.analytics;

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Conclave Metrics</p>
          <h2 className="mt-1 text-3xl font-black text-white">Session Analytics</h2>
        </div>
        {sessions.length > 0 && (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-xl border border-[#D97706]/30 bg-[#1C0C08] px-3.5 py-2 text-xs font-bold text-[#FDE68A]"
          >
            {sessions.map((s: any) => (
              <option key={s.id} value={s.id}>
                Session {String(s.sessionNumber).padStart(2, '0')} — {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-8 animate-spin text-[#F59E0B]" />
        </div>
      ) : a ? (
        <>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white">{analytics?.session?.name}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Total Attendance', a.totalAttendance, 'Verified check-ins'],
              ['Feedback Submitted', a.feedbackSubmitted, 'Delegate ratings'],
              ['Average Rating', a.averageRating ? `${a.averageRating} ★` : '—', 'Out of 5 stars'],
              ['Points Awarded', a.totalPointsAwarded, 'Attendance & Feedback points'],
            ].map(([label, value, note]) => (
              <div key={label as string} className="rajasthan-card rounded-2xl p-5 border border-[#D97706]/20">
                <span className="text-xs font-bold uppercase text-[#C9A88F]">{label}</span>
                <strong className="mt-3 block text-3xl font-black text-[#FDE68A]">{value}</strong>
                <span className="text-[11px] text-[#C9A88F]">{note}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D97706]/20 p-12 text-center text-[#C9A88F]">
          {sessions.length === 0 ? 'No sessions created yet.' : 'Select a session to view analytics.'}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   SETTINGS
───────────────────────────────────────── */
function SettingsPanel() {
  return (
    <>
      <h2 className="text-3xl font-black text-white">Settings & Rules</h2>
      <p className="mt-1 text-xs text-[#C9A88F]">Event configuration and point allocation rules.</p>
      <div className="mt-7 max-w-2xl space-y-3">
        {[
          ['Attendance Points', '10 points awarded per session check-in'],
          ['Feedback Points', '5 points awarded per session rating submission'],
          ['Code Validity', '60-second rolling code with SHA-256 validation'],
          ['Rate Limiting', '5 failed code attempts per minute per delegate'],
          ['Duplicate Check', 'Database constraint ensures max 1 attendance record per session'],
          ['Lucky Draw', 'Cryptographic backend selection from tied top scorers'],
        ].map(([label, note]) => (
          <div key={label as string} className="flex items-center justify-between rounded-xl border border-[#D97706]/20 bg-[#1C0C08] p-4">
            <div>
              <p className="font-bold text-sm text-white">{label}</p>
              <p className="text-xs text-[#C9A88F]">{note}</p>
            </div>
            <ShieldCheck className="size-5 text-[#F59E0B]" />
          </div>
        ))}
      </div>
    </>
  );
}
