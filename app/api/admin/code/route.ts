import { audit, db, hashCode, json, now } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

  if (!sessionId) return json({ error: 'sessionId is required.' }, 400);

  const session = await db()
    .prepare(`SELECT id, status, attendance_open as attendanceOpen FROM sessions WHERE id = ?`)
    .bind(sessionId)
    .first<{ id: string; status: string; attendanceOpen: number }>();

  if (!session) return json({ error: 'Session not found.' }, 404);
  if (session.status !== 'LIVE' || !session.attendanceOpen) {
    return json({ error: 'Attendance must be open (LIVE) to generate a code.' }, 409);
  }

  // Generate secure random 4-digit code using crypto
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const code = String(1000 + (random[0] % 9000));
  const stamp = now();
  const expiresAt = stamp + 120;
  const hash = await hashCode(sessionId, code);

  await db().batch([
    db()
      .prepare(`UPDATE session_codes SET revoked_at = ? WHERE session_id = ? AND revoked_at IS NULL`)
      .bind(stamp, sessionId),
    db()
      .prepare(
        `INSERT INTO session_codes (id, session_id, code_hash, display_code, expires_at, created_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      )
      .bind(crypto.randomUUID(), sessionId, hash, code, expiresAt, stamp),
  ]);

  await audit(user.userId, 'GENERATE_CODE', 'session', sessionId, { expiresAt });
  return json({ code, expiresAt, serverTime: stamp });
}
