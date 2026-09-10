import { db, ensureDemoData, getActiveSession, hashCode, json, now } from '@/lib/event-server';

export async function GET(request: Request) {
  await ensureDemoData();

  // Support ?sessionId= to fetch a specific session, or fall back to the first LIVE session
  const url = new URL(request.url);
  const requestedId = url.searchParams.get('sessionId')?.trim();

  const session = requestedId
    ? await db()
        .prepare(
          `SELECT id, session_number as sessionNumber, name, speaker, status, attendance_open as attendanceOpen, feedback_open as feedbackOpen FROM sessions WHERE id = ?`,
        )
        .bind(requestedId)
        .first<any>()
    : await getActiveSession();

  const sessionId = session?.id ?? null;

  let code = sessionId
    ? await db()
        .prepare(
          `SELECT display_code as code, expires_at as expiresAt FROM session_codes WHERE session_id = ? AND revoked_at IS NULL AND expires_at > ? ORDER BY created_at DESC LIMIT 1`,
        )
        .bind(sessionId, now())
        .first<{ code: string; expiresAt: number }>()
    : null;

  // Auto-generate a code if attendance is open and no valid code exists
  if (!code && sessionId && session?.attendanceOpen) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const newCode = String(1000 + (random[0] % 9000));
    const stamp = now();
    const expiresAt = stamp + 120;
    const hash = await hashCode(sessionId, newCode);
    await db().batch([
      db().prepare(`UPDATE session_codes SET revoked_at=? WHERE session_id=? AND revoked_at IS NULL`).bind(stamp, sessionId),
      db().prepare(`INSERT INTO session_codes (id,session_id,code_hash,display_code,expires_at,created_at,revoked_at) VALUES (?,?,?,?,?,?,NULL)`).bind(crypto.randomUUID(), sessionId, hash, newCode, expiresAt, stamp),
    ]);
    code = { code: newCode, expiresAt };
  }

  const [registered, present] = sessionId
    ? await Promise.all([
        db().prepare(`SELECT count(*) as count FROM participants WHERE enabled = 1`).first<{ count: number }>(),
        db().prepare(`SELECT count(*) as count FROM attendance WHERE session_id = ?`).bind(sessionId).first<{ count: number }>(),
      ])
    : [{ count: 0 }, { count: 0 }];

  return json({
    session,
    code,
    stats: {
      registered: registered?.count ?? 0,
      present: present?.count ?? 0,
    },
    serverTime: now(),
  });
}
