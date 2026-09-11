import { audit, db, json } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

/**
 * POST /api/admin/data-reset
 * Body: { scope: 'all' | 'scores' | 'participants' | 'session', sessionId?: string }
 *
 * scope='all'          – wipes every participant, attendance, feedback, quiz, score, draws
 * scope='scores'       – resets all score counters to zero (keeps participants & sessions)
 * scope='participants' – deletes all participants + their records (keeps sessions intact)
 * scope='session'      – clears attendance + feedback + codes for ONE session (requires sessionId)
 */
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const body = await request.json().catch(() => ({}));
  const scope: string = body.scope ?? '';
  const sessionId: string | undefined = body.sessionId;

  if (!['all', 'scores', 'participants', 'session'].includes(scope)) {
    return json({ error: 'Invalid scope. Must be: all | scores | participants | session' }, 400);
  }

  if (scope === 'session' && !sessionId) {
    return json({ error: 'sessionId is required for scope=session' }, 400);
  }

  try {
    if (scope === 'all') {
      await db().prepare(`DELETE FROM quiz_responses`).run();
      await db().prepare(`DELETE FROM code_attempts`).run();
      await db().prepare(`DELETE FROM feedback`).run();
      await db().prepare(`DELETE FROM attendance`).run();
      await db().prepare(`DELETE FROM scores`).run();
      await db().prepare(`DELETE FROM participant_sessions`).run();
      await db().prepare(`DELETE FROM draw_participants`).run();
      await db().prepare(`DELETE FROM draws`).run();
      await db().prepare(`DELETE FROM session_codes`).run();
      await db().prepare(`DELETE FROM participants`).run();
      await audit(user.userId, 'DATA_RESET_ALL', 'system', 'global', {});
    } else if (scope === 'scores') {
      await db()
        .prepare(
          `UPDATE scores SET attendance_points=0, feedback_points=0, quiz_points=0, total_points=0, sessions_attended=0, updated_at=strftime('%s','now')`,
        )
        .run();
      await audit(user.userId, 'DATA_RESET_SCORES', 'system', 'global', {});
    } else if (scope === 'participants') {
      await db().prepare(`DELETE FROM quiz_responses`).run();
      await db().prepare(`DELETE FROM code_attempts`).run();
      await db().prepare(`DELETE FROM feedback`).run();
      await db().prepare(`DELETE FROM attendance`).run();
      await db().prepare(`DELETE FROM scores`).run();
      await db().prepare(`DELETE FROM participant_sessions`).run();
      await db().prepare(`DELETE FROM draw_participants`).run();
      await db().prepare(`UPDATE draws SET winner_participant_id = NULL`).run();
      await db().prepare(`DELETE FROM participants`).run();
      await audit(user.userId, 'DATA_RESET_PARTICIPANTS', 'system', 'global', {});
    } else if (scope === 'session' && sessionId) {
      await db().prepare(`DELETE FROM code_attempts WHERE session_id = ?`).bind(sessionId).run();
      await db().prepare(`DELETE FROM session_codes WHERE session_id = ?`).bind(sessionId).run();
      await db().prepare(`DELETE FROM feedback WHERE session_id = ?`).bind(sessionId).run();
      await db().prepare(`DELETE FROM attendance WHERE session_id = ?`).bind(sessionId).run();
      // Recalculate scores from remaining attendance + feedback
      const remainingAttendance = await db()
        .prepare(`SELECT participant_id, SUM(points) as pts FROM attendance GROUP BY participant_id`)
        .all<{ participant_id: string; pts: number }>();
      const remainingFeedback = await db()
        .prepare(`SELECT participant_id, SUM(points) as pts FROM feedback GROUP BY participant_id`)
        .all<{ participant_id: string; pts: number }>();
      // Build score map
      const attMap = new Map<string, number>();
      for (const r of remainingAttendance.results) attMap.set(r.participant_id, r.pts ?? 0);
      const fbMap = new Map<string, number>();
      for (const r of remainingFeedback.results) fbMap.set(r.participant_id, r.pts ?? 0);
      // Get all affected participants (those who had attendance in this session)
      const allParticipants = await db()
        .prepare(`SELECT DISTINCT id FROM participants`)
        .all<{ id: string }>();
      for (const { id } of allParticipants.results) {
        const attPts = attMap.get(id) ?? 0;
        const total = attPts;
        const sessionsAttended = (
          await db()
            .prepare(`SELECT COUNT(*) as c FROM attendance WHERE participant_id = ?`)
            .bind(id)
            .first<{ c: number }>()
        )?.c ?? 0;
        const existing = await db()
          .prepare(`SELECT participant_id FROM scores WHERE participant_id = ?`)
          .bind(id)
          .first();
        if (existing) {
          await db()
            .prepare(
              `UPDATE scores SET attendance_points=?, feedback_points=0, quiz_points=0, total_points=?, sessions_attended=?, updated_at=strftime('%s','now') WHERE participant_id=?`,
            )
            .bind(attPts, total, sessionsAttended, id)
            .run();
        }
      }
      await audit(user.userId, 'DATA_RESET_SESSION', 'session', sessionId, {});
    }

    return json({ success: true, scope });
  } catch (err: any) {
    console.error('Data reset error:', err);
    return json({ error: `Reset failed: ${err?.message || 'Unknown error'}` }, 500);
  }
}
