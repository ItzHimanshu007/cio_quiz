import { db, getParticipant, hashCode, json, now } from '@/lib/event-server';
export async function POST(request: Request) {
  const participant = await getParticipant(request); if (!participant) return json({ error: 'Please register before marking attendance.' }, 401);
  const body = await request.json().catch(() => ({})); const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''; const code = typeof body.code === 'string' ? body.code : '';
  if (!/^\d{4}$/.test(code)) return json({ error: 'Enter the four-digit code shown on screen.' }, 400);
  const session = await db().prepare(`SELECT status, attendance_open as attendanceOpen, attendance_points as points FROM sessions WHERE id = ?`).bind(sessionId).first<{status:string;attendanceOpen:number;points:number}>();
  if (!session || session.status !== 'LIVE' || !session.attendanceOpen) return json({ error: 'Attendance for this session is currently closed.' }, 409);
  const prior = await db().prepare(`SELECT id FROM attendance WHERE participant_id = ? AND session_id = ?`).bind(participant.id, sessionId).first(); if (prior) return json({ error: 'You’re already marked present for this session.' }, 409);
  const attempts = await db().prepare(`SELECT count(*) as count FROM code_attempts WHERE participant_id = ? AND attempted_at > ?`).bind(participant.id, now() - 60).first<{count:number}>(); if ((attempts?.count ?? 0) >= 5) return json({ error: 'Too many attempts. Please wait one minute and try again.' }, 429);
  const codeHash = await hashCode(sessionId, code); const active = await db().prepare(`SELECT id FROM session_codes WHERE session_id = ? AND code_hash = ? AND expires_at > ? AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`).bind(sessionId, codeHash, now()).first();
  await db().prepare(`INSERT INTO code_attempts (id, participant_id, session_id, attempted_at, success) VALUES (?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), participant.id, sessionId, now(), active ? 1 : 0).run();
  if (!active) { const latest = await db().prepare(`SELECT expires_at as expiresAt FROM session_codes WHERE session_id = ? ORDER BY created_at DESC LIMIT 1`).bind(sessionId).first<{expiresAt:number}>(); return json({ error: latest && latest.expiresAt <= now() ? 'This session code has expired. Please enter the latest code shown on screen.' : 'That code isn’t correct. Please check the LED screen and try again.' }, 400); }
  const attendanceId = crypto.randomUUID(); const stamp = now();
  try { await db().batch([db().prepare(`INSERT INTO attendance (id, participant_id, session_id, points, verified_at, source) VALUES (?, ?, ?, ?, ?, 'code')`).bind(attendanceId, participant.id, sessionId, session.points, stamp), db().prepare(`UPDATE scores SET attendance_points = attendance_points + ?, total_points = total_points + ?, sessions_attended = sessions_attended + 1, updated_at = ? WHERE participant_id = ?`).bind(session.points, session.points, stamp, participant.id)]); } catch { return json({ error: 'You’re already marked present for this session.' }, 409); }
  return json({ success: true, points: session.points });
}
