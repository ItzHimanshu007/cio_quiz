import { db, getParticipant, hashCode, json, now } from '@/lib/event-server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const code = typeof body.code === 'string' ? body.code : '';

  if (!/^\d{4}$/.test(code)) {
    return json({ error: 'Enter the four-digit code displayed on the LED screen.' }, 400);
  }

  const session = await db()
    .prepare(
      `SELECT status, attendance_open as attendanceOpen, attendance_points as points FROM sessions WHERE id = ?`,
    )
    .bind(sessionId)
    .first<{ status: string; attendanceOpen: number; points: number }>();

  if (!session || session.status !== 'LIVE' || !session.attendanceOpen) {
    return json({ error: 'Attendance for this session is currently closed.' }, 409);
  }

  // --- Rate limiting: check failed attempts before code validation ---
  const participant = await getParticipant(request);
  if (participant) {
    const failedAttempts = await db()
      .prepare(
        `SELECT count(*) as count FROM code_attempts WHERE participant_id = ? AND session_id = ? AND success = 0 AND attempted_at > ?`,
      )
      .bind(participant.id, sessionId, now() - 60)
      .first<{ count: number }>();

    if ((failedAttempts?.count ?? 0) >= 5) {
      return json({ error: 'Too many incorrect attempts. Please wait a minute before trying again.' }, 429);
    }
  }

  const codeHash = await hashCode(sessionId, code);
  const active = await db()
    .prepare(
      `SELECT id FROM session_codes WHERE session_id = ? AND code_hash = ? AND expires_at > ? AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(sessionId, codeHash, now())
    .first();

  if (!active) {
    // Record failed attempt for rate limiting
    if (participant) {
      await db()
        .prepare(`INSERT INTO code_attempts (id, participant_id, session_id, attempted_at, success) VALUES (?, ?, ?, ?, 0)`)
        .bind(crypto.randomUUID(), participant.id, sessionId, now())
        .run();
    }

    const latest = await db()
      .prepare(
        `SELECT expires_at as expiresAt FROM session_codes WHERE session_id = ? ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(sessionId)
      .first<{ expiresAt: number }>();
    return json(
      {
        error:
          latest && latest.expiresAt <= now()
            ? 'This session code has expired. Please enter the latest code displayed on the LED screen.'
            : 'That code is not correct. Please check the LED screen and enter the current code.',
      },
      400,
    );
  }

  if (!participant) {
    // Code is valid, but this is the attendee's first session: proceed to Registration
    return json({ valid: true, requiresRegistration: true });
  }

  // Record successful attempt for rate limiting
  await db()
    .prepare(
      `INSERT INTO code_attempts (id, participant_id, session_id, attempted_at, success) VALUES (?, ?, ?, ?, 1)`,
    )
    .bind(crypto.randomUUID(), participant.id, sessionId, now())
    .run();

  const prior = await db()
    .prepare(`SELECT id FROM attendance WHERE participant_id = ? AND session_id = ?`)
    .bind(participant.id, sessionId)
    .first();

  if (prior) {
    return json({ success: true, alreadyMarked: true, points: 0 });
  }

  const attendanceId = crypto.randomUUID();
  const stamp = now();

  try {
    await db().batch([
      db()
        .prepare(
          `INSERT INTO attendance (id, participant_id, session_id, points, verified_at, source) VALUES (?, ?, ?, ?, ?, 'code')`,
        )
        .bind(attendanceId, participant.id, sessionId, session.points, stamp),
      db()
        .prepare(
          `UPDATE scores SET attendance_points = attendance_points + ?, total_points = total_points + ?, sessions_attended = sessions_attended + 1, updated_at = ? WHERE participant_id = ?`,
        )
        .bind(session.points, session.points, stamp, participant.id),
    ]);
  } catch {
    return json({ success: true, alreadyMarked: true, points: 0 });
  }

  return json({ success: true, points: session.points, alreadyMarked: false });
}
