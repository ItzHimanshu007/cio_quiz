'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, CircleAlert, Loader2, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CioLogo } from '@/components/cio-logo';

type Step = 'loading' | 'code' | 'register' | 'feedback' | 'complete';

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bfsi_token') || '';
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return {
    'content-type': 'application/json',
    ...(token ? { 'x-participant-token': token } : {}),
  };
}

export default function AttendeeFlow({ sessionId = 'session-04' }: { sessionId?: string }) {
  const [step, setStep] = useState<Step>('loading');
  const [participant, setParticipant] = useState<{ fullName: string; company: string } | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ name?: string; sessionNumber?: number; speaker?: string }>({});

  // Step 2: Code entry
  const [code, setCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');

  // Step 3: Registration (First visit)
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [company, setCompany] = useState('');

  // Step 4: Feedback
  const [rating, setRating] = useState(0);
  const [remark, setRemark] = useState('');

  const [attendancePoints, setAttendancePoints] = useState(10);
  const [feedbackPoints, setFeedbackPoints] = useState(5);
  const [totalEarned, setTotalEarned] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // 1. Check if URL has ?code=XXXX
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam && /^\d{4}$/.test(codeParam)) {
      setCode(codeParam);
    }

    // 2. Fetch session info for this specific sessionId
    fetch(`/api/live?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d: any) => {
        if (d.session) {
          setSessionInfo({
            name: d.session.name,
            sessionNumber: d.session.sessionNumber,
            speaker: d.session.speaker,
          });
        }
      })
      .catch(() => {});

    // 3. Check if attendee is already registered
    fetch('/api/me', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d: any) => {
        if (d.participant) {
          setParticipant(d.participant);
          setFullName(d.participant.fullName || '');
          setCompany(d.participant.company || '');
        }
        setStep('code');
      })
      .catch(() => {
        setStep('code');
      });
  }, [sessionId]);

  // Step 2: Submit Code
  async function submitCode(e?: FormEvent) {
    if (e) e.preventDefault();
    if (busy) return;
    setError('');

    if (code.length !== 4) {
      setError('Please enter the four-digit code displayed on the LED screen.');
      return;
    }

    setBusy(true);
    try {
      const r = await fetch('/api/attendance', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ sessionId, code }),
      });
      const d: any = await r.json();
      setBusy(false);

      if (!r.ok) {
        setError(d.error || 'Code verification failed.');
        return;
      }

      setVerifiedCode(code);
      if (d.points) setAttendancePoints(d.points);

      if (d.requiresRegistration || !participant) {
        setStep('register');
      } else if (d.alreadyMarked) {
        setTotalEarned(0);
        setStep('complete');
      } else {
        setTotalEarned(d.points || 100);
        setStep('feedback');
      }
    } catch {
      setBusy(false);
      setError('Network error verifying code. Please check your connection and try again.');
    }
  }

  // Step 3: Submit Registration
  async function submitRegistration(e?: FormEvent) {
    if (e) e.preventDefault();
    if (busy) return;
    setError('');

    const cleanName = fullName.trim();
    const cleanMobile = mobile.trim();
    const cleanCompany = company.trim();

    if (!cleanName || !cleanMobile || !cleanCompany) {
      setError('Please fill in your name, 10-digit mobile number, and company name.');
      return;
    }

    setBusy(true);
    try {
      const r = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          mobile: cleanMobile,
          company: cleanCompany,
          sessionId,
          code: verifiedCode || code,
        }),
      });
      const d: any = await r.json();
      setBusy(false);

      if (!r.ok) {
        setError(d.error || 'Registration failed.');
        return;
      }

      if (d.token) {
        localStorage.setItem('bfsi_token', d.token);
      }
      setParticipant(d.participant);
      if (d.attendance?.points) setAttendancePoints(d.attendance.points);
      setTotalEarned(d.attendance?.points || 100);

      setStep('feedback');
    } catch {
      setBusy(false);
      setError('Network error during registration. Please try again.');
    }
  }

  // Step 4: Submit Feedback
  async function submitFeedback(e?: FormEvent) {
    if (e) e.preventDefault();
    if (busy) return;
    setError('');

    if (!rating) {
      setError('Please select a star rating for this session.');
      return;
    }

    setBusy(true);
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          sessionId,
          rating,
          remark: remark.trim(),
        }),
      });
      const d: any = await r.json();
      setBusy(false);

      if (!r.ok) {
        setError(d.error || 'Failed to submit feedback.');
        return;
      }

      const fb = d.points || 0;
      setFeedbackPoints(fb);
      setTotalEarned((prev) => prev + fb);
      setStep('complete');
    } catch {
      setBusy(false);
      setError('Network error submitting feedback.');
    }
  }

  const sessionLabel = sessionInfo.sessionNumber
    ? `Session ${String(sessionInfo.sessionNumber).padStart(2, '0')}`
    : 'Session';

  return (
    <main className="rajasthan-backdrop min-h-screen px-4 py-6 text-[#FFF8F0] sm:py-10">
      <div className="mx-auto max-w-md">
        {/* Top Header with CIO Logo */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#C9A88F]">
          <a href="/" className="flex items-center gap-1.5 font-bold hover:text-[#F59E0B] text-[#FDE68A] uppercase tracking-wider">
            <ChevronLeft className="size-4" /> Home
          </a>
          <div className="scale-75 origin-right">
            <CioLogo size="sm" showSubtitle={false} />
          </div>
        </div>

        {/* Delegate Card */}
        <section className="rajasthan-card-gold rounded-[28px] p-6 shadow-2xl sm:p-8 backdrop-blur-xl">
          {/* LOADING */}
          {step === 'loading' && (
            <div className="grid min-h-80 place-items-center">
              <Loader2 className="size-8 animate-spin text-[#F59E0B]" />
            </div>
          )}

          {/* STEP 2 — Enter random code */}
          {step === 'code' && (
            <>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-[#D97706]/40 bg-[#4A1A10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FDE68A]">
                  {sessionLabel} · Attendance
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
                  <span className="size-2 animate-pulse rounded-full bg-[#F59E0B]" /> LIVE
                </span>
              </div>

              {sessionInfo.name && (
                <h2 className="mt-4 text-xl font-bold text-white">{sessionInfo.name}</h2>
              )}

              <h1 className="mt-3 text-2xl font-black tracking-tight text-[#FDE68A]">
                Enter Session Code
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#C9A88F]">
                Enter the 4-digit code shown on the auditorium screen to verify check-in and earn 10 points.
              </p>

              <form onSubmit={submitCode}>
                <InputOTP maxLength={4} value={code} onChange={setCode} containerClassName="mt-6 justify-center">
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-14 sm:size-16 rounded-2xl border-2 border-[#D97706]/40 bg-[#1C0C08] text-2xl font-black text-[#FDE68A] data-[active=true]:border-[#F59E0B] data-[active=true]:ring-2 data-[active=true]:ring-[#F59E0B]/30"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <ErrorMsg text={error} />

                <Button
                  type="submit"
                  onClick={() => submitCode()}
                  disabled={busy || code.length !== 4}
                  className="btn-rajasthan-primary mt-7 h-12 w-full rounded-xl text-base"
                >
                  {busy ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> Verifying Code…
                    </>
                  ) : (
                    <>
                      Confirm Attendance <ArrowRight className="ml-1.5 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* STEP 3 — Registration (only if first visit) */}
          {step === 'register' && (
            <>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-[#D97706]/40 bg-[#4A1A10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FDE68A]">
                  Delegate Registration
                </span>
                <span className="text-xs font-bold text-[#F59E0B]">Code Verified ✓</span>
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
                Enter Delegate Details
              </h1>
              <p className="mt-1 text-xs text-[#C9A88F]">
                Required once. Your points track across all sessions automatically.
              </p>

              <form onSubmit={submitRegistration} className="mt-6 space-y-4">
                <Field label="Full Name *">
                  <Input
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="h-12 border-[#D97706]/30 bg-[#1C0C08] text-white placeholder:text-stone-500"
                  />
                </Field>
                <Field label="Mobile Number *">
                  <Input
                    name="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    className="h-12 border-[#D97706]/30 bg-[#1C0C08] text-white placeholder:text-stone-500"
                  />
                </Field>
                <Field label="Company Name *">
                  <Input
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="e.g. State Bank of India, HDFC, etc."
                    className="h-12 border-[#D97706]/30 bg-[#1C0C08] text-white placeholder:text-stone-500"
                  />
                </Field>

                <ErrorMsg text={error} />

                <Button
                  type="submit"
                  onClick={() => submitRegistration()}
                  disabled={busy}
                  className="btn-rajasthan-primary mt-6 h-12 w-full rounded-xl text-base"
                >
                  {busy ? <Loader2 className="animate-spin" /> : <>Register & Continue <ArrowRight className="ml-1.5 size-4" /></>}
                </Button>
              </form>
            </>
          )}

          {/* STEP 4 — Session Feedback */}
          {step === 'feedback' && (
            <>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-[#D97706]/40 bg-[#4A1A10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FDE68A]">
                  Session Feedback
                </span>
                <span className="rounded-full bg-[#BE123C]/20 border border-[#BE123C]/40 px-2.5 py-0.5 text-xs font-bold text-[#FCA5A5]">
                  +100 Pts Verified
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
                Rate this Session
              </h1>
              <p className="mt-1 text-xs text-[#C9A88F]">
                Provide your rating and key takeaways for this session.
              </p>

              <form onSubmit={submitFeedback} className="mt-6">
                <div className="rounded-2xl border border-[#D97706]/30 bg-[#1C0C08] p-4">
                  <Stars value={rating} onChange={setRating} />
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#FCE7D2]">
                    Key Takeaways & Remarks (Optional)
                  </p>
                  <Textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    maxLength={280}
                    placeholder="Share your perspective on this session's themes…"
                    className="min-h-24 border-[#D97706]/30 bg-[#1C0C08] text-white placeholder:text-stone-500"
                  />
                </div>

                <ErrorMsg text={error} />

                <Button
                  type="submit"
                  onClick={() => submitFeedback()}
                  disabled={busy}
                  className="btn-rajasthan-primary mt-6 h-12 w-full rounded-xl text-base"
                >
                  {busy ? <Loader2 className="animate-spin" /> : 'Submit Feedback'}
                </Button>
              </form>
            </>
          )}

          {/* STEP 5 — Complete */}
          {step === 'complete' && (
            <div className="py-3 text-center">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#F59E0B]/20 border-2 border-[#F59E0B] text-[#F59E0B]">
                <Trophy className="size-10" />
              </div>
              <h1 className="mt-5 text-3xl font-black text-white">
                {totalEarned > 0 ? 'Check-in Confirmed!' : 'Attendance Recorded'}
              </h1>
              {totalEarned > 0 ? (
                <>
                  <p className="mt-2 text-sm text-[#C9A88F]">
                    You earned <strong className="text-[#FDE68A] text-lg font-black">{totalEarned} points</strong> for {sessionLabel}.
                  </p>
                  <div className="mt-5 flex justify-center gap-4 text-xs font-bold text-[#FCE7D2]">
                    <span className="flex items-center gap-1.5 rounded-lg bg-[#4A1A10] px-3 py-1 border border-[#D97706]/30">
                      <Check className="size-4 text-[#F59E0B]" /> Attendance (+100)
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-[#4A1A10] px-3 py-1 border border-[#D97706]/30">
                      <Check className="size-4 text-[#F59E0B]" /> Feedback Submitted
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-[#C9A88F]">
                  Your attendance for {sessionLabel} is already confirmed on the leaderboard.
                </p>
              )}
              <a
                href="/leaderboard"
                className="btn-rajasthan-primary mt-8 flex h-12 items-center justify-center rounded-xl text-base"
              >
                View Leaderboard <ArrowRight className="ml-2 size-4" />
              </a>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-[#C9A88F]">
          Organized by <strong>CIO Association Rajasthan Chapter</strong>
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#FCE7D2]">{label}</span>
      {children}
    </label>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return text ? (
    <div role="alert" className="mt-4 flex gap-2 rounded-xl bg-[#BE123C]/20 border border-[#BE123C]/40 p-3 text-xs font-bold text-[#FCA5A5]">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {text}
    </div>
  ) : null;
}

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex justify-between px-3 py-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="p-1 transition hover:scale-125"
        >
          <Star
            className={`size-10 transition ${
              n <= value ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-stone-700 hover:text-[#FCD34D]'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
