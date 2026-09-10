import { db, json } from '@/lib/event-server';
export async function GET(){const row=await db().prepare(`SELECT d.id,d.prize,d.completed_at as completedAt,p.full_name as name,p.company FROM draws d JOIN participants p ON p.id=d.winner_participant_id WHERE d.status='COMPLETED' ORDER BY d.completed_at DESC LIMIT 1`).first();return json({winner:row});}
