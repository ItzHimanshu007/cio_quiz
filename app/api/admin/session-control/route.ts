import { audit, cleanText, db, json } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const body = await request.json().catch(() => ({}));
  const sessionId = cleanText(body.sessionId, 80);
  const action = typeof body.action === 'string' ? body.action : '';

  if (!sessionId) return json({ error: 'sessionId is required.' }, 400);

  const session = await db()
    .prepare(`SELECT id, status FROM sessions WHERE id = ?`)
    .bind(sessionId)
    .first<{ id: string; status: string }>();

  if (!session) return json({ error: 'Session not found.' }, 404);

  if (action === 'open_attendance') {
    await db()
      .prepare(`UPDATE sessions SET attendance_open = 1, status = 'LIVE' WHERE id = ?`)
      .bind(sessionId)
      .run();
    await audit(user.userId, 'OPEN_ATTENDANCE', 'session', sessionId, { action });
    return json({ success: true, attendanceOpen: true, status: 'LIVE' });
  }

  if (action === 'close_attendance') {
    await db()
      .prepare(`UPDATE sessions SET attendance_open = 0, feedback_open = 1, status = 'COMPLETED' WHERE id = ?`)
      .bind(sessionId)
      .run();
    await audit(user.userId, 'CLOSE_ATTENDANCE', 'session', sessionId, { action });
    return json({ success: true, attendanceOpen: false, status: 'COMPLETED' });
  }

  // Legacy toggle support (attendanceOpen / feedbackOpen / quizOpen)
  const allowed = ['attendanceOpen', 'feedbackOpen', 'quizOpen'] as const;
  const field = allowed.find((x) => x === body.field);
  if (field && typeof body.open === 'boolean') {
    const column = { attendanceOpen: 'attendance_open', feedbackOpen: 'feedback_open', quizOpen: 'quiz_open' }[field];
    await db()
      .prepare(`UPDATE sessions SET ${column} = ? WHERE id = ?`)
      .bind(body.open ? 1 : 0, sessionId)
      .run();
    await audit(user.userId, 'SESSION_CONTROL', 'session', sessionId, { field, open: body.open });
    return json({ success: true });
  }

  return json({ error: 'Invalid action. Use: open_attendance | close_attendance' }, 400);
}
