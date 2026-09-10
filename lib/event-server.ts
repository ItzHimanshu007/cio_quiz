import { env } from 'cloudflare:workers';

/** @deprecated Use getActiveSession() instead */
export const LIVE_SESSION_ID = 'session-04';

export function db() { return env.DB; }
export function now() { return Math.floor(Date.now() / 1000); }
export function json(data: unknown, status = 200, headers?: HeadersInit) { return Response.json(data, { status, headers: { 'cache-control': 'no-store', ...headers } }); }
export function cleanText(value: unknown, max = 160) { return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, max) : ''; }
export function normalizeMobile(value: unknown) { return cleanText(value, 20).replace(/\D/g, '').slice(-10); }
export async function hashCode(sessionId: string, code: string) { const bytes = new TextEncoder().encode(`${sessionId}:${code}`); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
export function participantToken(request: Request) {
  const headerToken =
    request.headers.get('x-participant-token') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (headerToken) return headerToken.trim();
  const match = request.headers.get('cookie')?.match(/(?:^|;\s*)bfsi_participant=([^;]+)/);
  return match?.[1] ?? null;
}

/** Returns the currently LIVE session, or null if none. */
export async function getActiveSession() {
  return db()
    .prepare(`SELECT id, session_number as sessionNumber, name, status, attendance_open as attendanceOpen, feedback_open as feedbackOpen FROM sessions WHERE status = 'LIVE' ORDER BY session_number LIMIT 1`)
    .first<{ id: string; sessionNumber: number; name: string; status: string; attendanceOpen: number; feedbackOpen: number }>();
}

export async function ensureDemoData() {
  // Only seed demo data in non-production environments
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;
  const timestamp = now();
  // Insert as UPCOMING so admin must explicitly open it — avoids hardcoded LIVE assumption
  await db().prepare(`INSERT OR IGNORE INTO sessions (id, session_number, name, speaker, description, starts_at, ends_at, status, attendance_open, feedback_open, quiz_open, attendance_points, feedback_points, quiz_points) VALUES (?, ?, ?, ?, ?, ?, ?, 'UPCOMING', 0, 0, 0, 10, 5, 10)`)
    .bind(LIVE_SESSION_ID, 4, 'Digital Transformation in BFSI', 'Priya Mehta · FutureBank Labs', 'How intelligent infrastructure is reshaping financial services.', timestamp - 1200, timestamp + 2400)
    .run();
}

export async function getParticipant(request: Request) {
  const token = participantToken(request); if (!token) return null;
  return db().prepare(`SELECT p.id, p.full_name as fullName, p.mobile, p.company FROM participant_sessions ps JOIN participants p ON p.id = ps.participant_id WHERE ps.token = ? AND ps.expires_at > ? AND p.enabled = 1`).bind(token, now()).first<{id:string; fullName:string; mobile:string; company:string}>();
}

export async function audit(actorId: string, action: string, entityType: string, entityId: string, detail: unknown) {
  await db().prepare(`INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, detail_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), actorId, action, entityType, entityId, JSON.stringify(detail), now()).run();
}
