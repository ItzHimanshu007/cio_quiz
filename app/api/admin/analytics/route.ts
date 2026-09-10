import { db, json } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId')?.trim();

  if (!sessionId) {
    return json({ error: 'sessionId query parameter is required.' }, 400);
  }

  const session = await db()
    .prepare(`SELECT id, session_number as sessionNumber, name FROM sessions WHERE id = ?`)
    .bind(sessionId)
    .first<{ id: string; sessionNumber: number; name: string }>();

  if (!session) return json({ error: 'Session not found.' }, 404);

  const [attendance, feedbackStats, pointsResult] = await Promise.all([
    db()
      .prepare(`SELECT count(*) as count, COALESCE(sum(points), 0) as pts FROM attendance WHERE session_id = ?`)
      .bind(sessionId)
      .first<{ count: number; pts: number }>(),
    db()
      .prepare(
        `SELECT count(*) as count, COALESCE(avg(CAST(rating AS REAL)), 0) as avgRating FROM feedback WHERE session_id = ?`,
      )
      .bind(sessionId)
      .first<{ count: number; avgRating: number }>(),
    db()
      .prepare(
        `SELECT COALESCE(sum(a.points), 0) + COALESCE(sum(f.points), 0) as totalAwarded FROM sessions s LEFT JOIN attendance a ON a.session_id = s.id LEFT JOIN feedback f ON f.session_id = s.id WHERE s.id = ?`,
      )
      .bind(sessionId)
      .first<{ totalAwarded: number }>(),
  ]);

  return json({
    session,
    analytics: {
      totalAttendance: attendance?.count ?? 0,
      feedbackSubmitted: feedbackStats?.count ?? 0,
      averageRating: feedbackStats?.avgRating ? Math.round(feedbackStats.avgRating * 10) / 10 : 0,
      attendancePoints: attendance?.pts ?? 0,
      totalPointsAwarded: pointsResult?.totalAwarded ?? 0,
    },
  });
}
