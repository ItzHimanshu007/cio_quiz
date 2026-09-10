import { db, ensureDemoData, getActiveSession, json } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);
  await ensureDemoData();

  const activeSession = await getActiveSession();

  const [registered, present, feedbackCount, leader, ties] = await Promise.all([
    db().prepare(`SELECT count(*) as value FROM participants WHERE enabled = 1`).first<{ value: number }>(),
    activeSession
      ? db().prepare(`SELECT count(*) as value FROM attendance WHERE session_id = ?`).bind(activeSession.id).first<{ value: number }>()
      : Promise.resolve({ value: 0 }),
    activeSession
      ? db().prepare(`SELECT count(*) as value FROM feedback WHERE session_id = ?`).bind(activeSession.id).first<{ value: number }>()
      : Promise.resolve({ value: 0 }),
    db()
      .prepare(
        `SELECT p.full_name as name, s.total_points as points FROM scores s JOIN participants p ON p.id = s.participant_id ORDER BY s.total_points DESC LIMIT 1`,
      )
      .first<{ name: string; points: number }>(),
    db()
      .prepare(
        `SELECT count(*) as value FROM scores WHERE total_points = (SELECT max(total_points) FROM scores) AND total_points > 0`,
      )
      .first<{ value: number }>(),
  ]);

  return json({
    activeSession: activeSession ?? null,
    registered: (registered as any)?.value ?? 0,
    present: (present as any)?.value ?? 0,
    feedback: (feedbackCount as any)?.value ?? 0,
    leader: leader ?? { name: 'Awaiting first score', points: 0 },
    ties: (ties as any)?.value ?? 0,
  });
}
