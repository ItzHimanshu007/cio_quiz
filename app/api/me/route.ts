import { getParticipant, json } from '@/lib/event-server';
export async function GET(request: Request) { return json({ participant: await getParticipant(request) }); }
