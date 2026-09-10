import { db, json } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  // Returns ranked participants WITH mobile numbers (admin only)
  const rows = await db()
    .prepare(
      `SELECT
        p.id,
        p.full_name as name,
        p.mobile,
        p.company,
        s.sessions_attended as sessionsAttended,
        s.attendance_points as attendancePoints,
        s.feedback_points as feedbackPoints,
        s.total_points as totalPoints
      FROM scores s
      JOIN participants p ON p.id = s.participant_id
      WHERE p.enabled = 1
      ORDER BY s.total_points DESC, s.sessions_attended DESC, s.updated_at ASC
      LIMIT 200`,
    )
    .all();

  const leaderboard = rows.results as any[];

  // Find max score for tie detection
  const maxPoints = leaderboard.length > 0 ? (leaderboard[0] as any).totalPoints : 0;
  const tiedCount = maxPoints > 0 ? leaderboard.filter((r: any) => r.totalPoints === maxPoints).length : 0;
  const tiedParticipants = tiedCount > 1 ? leaderboard.filter((r: any) => r.totalPoints === maxPoints) : [];

  return json({
    leaderboard,
    tieDetection: {
      isTie: tiedCount > 1,
      tiedCount,
      maxPoints,
      tiedParticipants,
    },
  });
}
