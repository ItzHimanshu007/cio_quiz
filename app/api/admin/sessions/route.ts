import { audit, cleanText, db, ensureDemoData, json, now } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);
  await ensureDemoData();
  const rows = await db()
    .prepare(
      `SELECT id, session_number as sessionNumber, name, speaker, description, starts_at as startsAt, ends_at as endsAt, status, attendance_open as attendanceOpen, feedback_open as feedbackOpen, attendance_points as attendancePoints, feedback_points as feedbackPoints FROM sessions ORDER BY session_number`,
    )
    .all();
  return json({ sessions: rows.results });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const body = await request.json().catch(() => ({}));
  const name = cleanText(body.name, 120);
  const speaker = cleanText(body.speaker, 120) || 'TBD'; // speaker is optional in UI
  const number = Number(body.sessionNumber);
  const startsAt = Number(body.startsAt);
  const endsAt = Number(body.endsAt);

  if (!name || !Number.isInteger(number) || number < 1) {
    return json({ error: 'Enter a valid session number (≥1) and session name.' }, 400);
  }

  const id = cleanText(body.id, 80) || `session-${String(number).padStart(2, '0')}`;

  const status = ['UPCOMING', 'LIVE', 'COMPLETED'].includes(body.status) ? body.status : 'UPCOMING';
  const attendanceOpen = status === 'LIVE' ? 1 : 0;

  try {
    await db()
      .prepare(
        `INSERT INTO sessions (id, session_number, name, speaker, description, starts_at, ends_at, status, attendance_open, feedback_open, quiz_open, attendance_points, feedback_points, quiz_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 0)`,
      )
      .bind(
        id,
        number,
        name,
        speaker,
        cleanText(body.description, 400) || null,
        startsAt || now(),
        endsAt || (startsAt ? startsAt + 7200 : now() + 7200),
        status,
        attendanceOpen,
        Number(body.attendancePoints) || 10,
        Number(body.feedbackPoints) || 5,
      )
      .run();
  } catch {
    return json({ error: 'That session number already exists. Choose a different session number.' }, 409);
  }

  await audit(user.userId, 'CREATE_SESSION', 'session', id, { number, name });
  return json({ success: true, id }, 201);
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return json({ error: 'Session ID is required.' }, 400);
  }

  try {
    await db().prepare('DELETE FROM session_codes WHERE session_id = ?').bind(sessionId).run();
    await db().prepare('DELETE FROM attendance WHERE session_id = ?').bind(sessionId).run();
    await db().prepare('DELETE FROM feedback WHERE session_id = ?').bind(sessionId).run();
    await db().prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    await audit(user.userId, 'DELETE_SESSION', 'session', sessionId, {});
    return json({ success: true });
  } catch (err) {
    return json({ error: 'Failed to delete session.' }, 500);
  }
}
