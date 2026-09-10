import { cleanText, db, ensureDemoData, hashCode, json, normalizeMobile, now } from '@/lib/event-server';

export async function POST(request: Request) {
  await ensureDemoData();
  const body = await request.json().catch(() => ({}));

  const mobile = normalizeMobile(body.mobile);
  const fullName = cleanText(body.fullName, 80);
  const company = cleanText(body.company, 100);

  if (mobile.length !== 10 || !fullName || !company) {
    return json({ error: 'Please enter your name, 10-digit mobile number and company.' }, 400);
  }

  const recent = await db()
    .prepare(`SELECT count(*) as count FROM participants WHERE mobile = ? AND created_at > ?`)
    .bind(mobile, now() - 60)
    .first<{ count: number }>();

  // Find existing participant by mobile (idempotent registration)
  let participant = await db()
    .prepare(`SELECT id, full_name as fullName, company FROM participants WHERE mobile = ?`)
    .bind(mobile)
    .first<{ id: string; fullName: string; company: string }>();

  if (!participant) {
    // New participant — create record + scores row
    const id = crypto.randomUUID();
    await db().batch([
      db()
        .prepare(
          `INSERT INTO participants (id, full_name, mobile, company, designation, email, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        )
        .bind(id, fullName, mobile, company, null, null, now()),
      db()
        .prepare(`INSERT INTO scores (participant_id, updated_at) VALUES (?, ?)`)
        .bind(id, now()),
    ]);
    participant = { id, fullName, company };
  } else if ((recent?.count ?? 0) > 3) {
    return json({ error: 'Too many attempts. Please wait a moment and try again.' }, 429);
  }

  // Generate session token and store it in participant_sessions
  const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
  const tokenExpiry = now() + 60 * 60 * 24 * 7; // 7 days

  await db()
    .prepare(`INSERT INTO participant_sessions (token, participant_id, expires_at) VALUES (?, ?, ?)`)
    .bind(token, participant.id, tokenExpiry)
    .run();

  // Mark attendance if a valid code was provided during registration
  let attendanceAwarded = 0;
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const code = typeof body.code === 'string' ? body.code : '';

  if (sessionId && code) {
    const session = await db()
      .prepare(
        `SELECT status, attendance_open as attendanceOpen, attendance_points as points FROM sessions WHERE id = ?`,
      )
      .bind(sessionId)
      .first<{ status: string; attendanceOpen: number; points: number }>();

    if (session && session.status === 'LIVE' && session.attendanceOpen) {
      const codeHash = await hashCode(sessionId, code);
      const active = await db()
        .prepare(
          `SELECT id FROM session_codes WHERE session_id = ? AND code_hash = ? AND expires_at > ? AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`,
        )
        .bind(sessionId, codeHash, now())
        .first();

      if (active) {
        const prior = await db()
          .prepare(`SELECT id FROM attendance WHERE participant_id = ? AND session_id = ?`)
          .bind(participant.id, sessionId)
          .first();

        if (!prior) {
          const stamp = now();
          try {
            await db().batch([
              db()
                .prepare(
                  `INSERT INTO attendance (id, participant_id, session_id, points, verified_at, source) VALUES (?, ?, ?, ?, ?, 'code')`,
                )
                .bind(crypto.randomUUID(), participant.id, sessionId, session.points, stamp),
              db()
                .prepare(
                  `UPDATE scores SET attendance_points = attendance_points + ?, total_points = total_points + ?, sessions_attended = sessions_attended + 1, updated_at = ? WHERE participant_id = ?`,
                )
                .bind(session.points, session.points, stamp, participant.id),
            ]);
            attendanceAwarded = session.points;
          } catch {
            // Duplicate attendance — ignore
          }
        }
      }
    }
  }

  // Set HttpOnly cookie as secondary auth (browser requests) in addition to the token header
  const isHttps =
    request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
  const cookieFlags = `bfsi_participant=${token}; HttpOnly${isHttps ? '; Secure' : ''}; SameSite=Lax; Path=/; Max-Age=604800`;

  return json(
    {
      participant: { fullName: participant.fullName, company: participant.company },
      token,
      attendance: { awarded: attendanceAwarded > 0, points: attendanceAwarded },
    },
    200,
    { 'set-cookie': cookieFlags },
  );
}
