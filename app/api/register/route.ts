import { cleanText, db, ensureDemoData, json, normalizeMobile, now } from '@/lib/event-server';
export async function POST(request: Request) {
  await ensureDemoData(); const body = await request.json().catch(() => ({}));
  const mobile = normalizeMobile(body.mobile); const fullName = cleanText(body.fullName, 80); const company = cleanText(body.company, 100);
  if (mobile.length !== 10 || !fullName || !company) return json({ error: 'Please enter your name, 10-digit mobile number and company.' }, 400);
  const recent = await db().prepare(`SELECT count(*) as count FROM participants WHERE mobile = ? AND created_at > ?`).bind(mobile, now() - 60).first<{count:number}>();
  let participant = await db().prepare(`SELECT id, full_name as fullName, company FROM participants WHERE mobile = ?`).bind(mobile).first<{id:string;fullName:string;company:string}>();
  if (!participant) { const id = crypto.randomUUID(); await db().prepare(`INSERT INTO participants (id, full_name, mobile, company, designation, email, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`).bind(id, fullName, mobile, company, cleanText(body.designation, 80) || null, cleanText(body.email, 120) || null, now()).run(); await db().prepare(`INSERT INTO scores (participant_id, updated_at) VALUES (?, ?)`).bind(id, now()).run(); participant = { id, fullName, company }; }
  else if ((recent?.count ?? 0) > 3) return json({ error: 'Too many attempts. Please wait a moment and try again.' }, 429);
  const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
  await db().prepare(`INSERT INTO participant_sessions (token, participant_id, expires_at) VALUES (?, ?, ?)`).bind(token, participant.id, now() + 86400 * 7).run();
  return json({ participant: { fullName: participant.fullName, company: participant.company } }, 200, { 'set-cookie': `bfsi_participant=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800` });
}
