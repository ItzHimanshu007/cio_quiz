import { cleanText, db, getParticipant, json, now } from '@/lib/event-server';

export async function POST(request: Request) {
  const participant = await getParticipant(request);
  if (!participant) return json({ error: 'Please register first.' }, 401);

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const rating = Number(body.rating);

  if (![1, 2, 3, 4, 5].includes(rating)) {
    return json({ error: 'Please select a star rating between 1 and 5.' }, 400);
  }

  const remark = cleanText(body.remark, 280) || null;

  // Check session exists and get feedback points
  const session = await db()
    .prepare(`SELECT id, feedback_points as points FROM sessions WHERE id = ?`)
    .bind(sessionId)
    .first<{ id: string; points: number }>();

  if (!session) return json({ error: 'Session not found.' }, 404);

  // Feedback is available whenever the participant has attended the session
  const attended = await db()
    .prepare(`SELECT id FROM attendance WHERE participant_id = ? AND session_id = ?`)
    .bind(participant.id, sessionId)
    .first();

  if (!attended) return json({ error: 'Please verify attendance before sharing feedback.' }, 409);

  // Check for duplicate feedback
  const existingFeedback = await db()
    .prepare(`SELECT id FROM feedback WHERE participant_id = ? AND session_id = ?`)
    .bind(participant.id, sessionId)
    .first();

  if (existingFeedback) {
    return json({ error: "You've already submitted feedback for this session." }, 409);
  }

  try {
    const stamp = now();
    await db().batch([
      db()
        .prepare(
          `INSERT INTO feedback (id, participant_id, session_id, rating, relevance, takeaway, points, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          participant.id,
          sessionId,
          rating,
          rating,   // relevance = same as rating (field exists in schema but not used in UX)
          remark,   // takeaway column holds the optional remark
          0,        // feedback points = 0
          stamp,
        ),
      db()
        .prepare(
          `UPDATE scores SET updated_at = ? WHERE participant_id = ?`,
        )
        .bind(stamp, participant.id),
    ]);
  } catch {
    return json({ error: "You've already submitted feedback for this session." }, 409);
  }

  return json({ success: true, points: 0 });
}
