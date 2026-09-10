import { audit, cleanText, db, json, now } from '@/lib/event-server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const rows = await db()
    .prepare(
      `SELECT d.id, d.prize, d.winner_participant_id as winnerParticipantId, d.eligible_json as eligibleJson, d.status, d.created_at as createdAt, d.completed_at as completedAt,
              p.full_name as winnerName, p.company as winnerCompany, s.total_points as points
       FROM draws d
       LEFT JOIN participants p ON p.id = d.winner_participant_id
       LEFT JOIN scores s ON s.participant_id = d.winner_participant_id
       ORDER BY d.created_at DESC
       LIMIT 20`,
    )
    .all();

  return json({ draws: rows.results });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in required.' }, 401);

  const body = await request.json().catch(() => ({}));
  const prize = cleanText(body.prize) || 'Highest Score Award';

  const top = await db().prepare(`SELECT max(total_points) as value FROM scores`).first<{ value: number }>();
  if (!top?.value) return json({ error: 'No scored participants are eligible yet.' }, 400);

  const finalists = await db()
    .prepare(
      `SELECT p.id, p.full_name as name, p.company, s.total_points as points
       FROM scores s
       JOIN participants p ON p.id = s.participant_id
       WHERE s.total_points = ? AND p.enabled = 1
       ORDER BY p.id`,
    )
    .bind(top.value)
    .all();

  if (finalists.results.length < 2) {
    return json({ error: 'A lucky draw is available only when the highest score is tied.' }, 400);
  }

  // Cryptographically secure selection
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const winnerIndex = random[0] % finalists.results.length;
  const winner = finalists.results[winnerIndex] as any;

  const id = crypto.randomUUID();
  const stamp = now();

  const statements = [
    db()
      .prepare(
        `INSERT INTO draws (id, prize, winner_participant_id, eligible_json, status, created_at, completed_at)
         VALUES (?, ?, ?, ?, 'COMPLETED', ?, ?)`,
      )
      .bind(id, prize, winner.id, JSON.stringify(finalists.results.map((f: any) => f.id)), stamp, stamp),
    ...finalists.results.map((f: any) =>
      db().prepare(`INSERT INTO draw_participants (draw_id, participant_id) VALUES (?, ?)`).bind(id, f.id),
    ),
  ];

  await db().batch(statements);
  await audit(user.userId, 'COMPLETE_DRAW', 'draw', id, {
    prize,
    finalists: finalists.results.length,
    winnerId: winner.id,
  });

  return json({
    draw: {
      id,
      prize,
      createdAt: stamp,
      finalists: finalists.results,
      winner,
    },
  });
}
