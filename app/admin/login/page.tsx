'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, ChevronLeft, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CioLogo, EventDateBadge } from '@/components/cio-logo';

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!passcode.trim() || busy) return;

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok) {
        setError(data.error || 'Access denied. Incorrect passcode.');
        return;
      }

      // Check return_to param
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('return_to') || '/admin';
      window.location.href = returnTo;
    } catch {
      setBusy(false);
      setError('Network error authenticating. Please try again.');
    }
  }

  return (
    <main className="rajasthan-backdrop flex min-h-screen flex-col items-center justify-center p-5 text-[#FFF8F0]">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#FDE68A] hover:text-[#F59E0B] uppercase tracking-wider transition"
          >
            <ChevronLeft className="size-4" /> Conclave Home
          </a>
          <span className="text-[11px] font-bold text-[#C9A88F] uppercase tracking-wider">
            Authorized Personnel Only
          </span>
        </div>

        {/* Login Card */}
        <div className="rajasthan-card-gold rounded-[32px] p-7 sm:p-9 shadow-2xl border-2 border-[#D97706]/40 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <CioLogo size="md" />

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D97706]/40 bg-[#1C0C08] px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#FDE68A]">
                <Lock className="size-3 text-[#F59E0B]" /> Admin Console Access
              </span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Event Control
            </h1>
            <p className="mt-1.5 text-xs text-[#C9A88F]">
              Enter the administrator access passcode to manage conclave sessions, attendance codes, and leaderboards.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FCE7D2] mb-1.5">
                Admin Passcode
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter admin passcode"
                  required
                  autoFocus
                  className="h-12 bg-[#1C0C08] border-[#D97706]/40 text-white pl-10 placeholder:text-stone-600 focus-visible:ring-[#F59E0B]"
                />
                <KeyRound className="absolute left-3.5 top-3.5 size-4 text-[#D97706]" />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[#BE123C]/50 bg-[#BE123C]/20 p-3 text-xs font-bold text-[#FCA5A5] text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={busy || !passcode}
              className="btn-rajasthan-primary mt-2 h-12 w-full rounded-xl text-sm font-bold tracking-wide"
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Authenticating…
                </>
              ) : (
                <>
                  Enter Admin Console <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#D97706]/20 pt-4 text-[11px] text-[#C9A88F]">
            <ShieldCheck className="size-3.5 text-[#F59E0B]" />
            <span>Encrypted 24-Hour Administrator Session</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#C9A88F]">
          Organized by <strong>CIO Association Rajasthan Chapter</strong> · 12 Sep 2026
        </p>
      </div>
    </main>
  );
}
