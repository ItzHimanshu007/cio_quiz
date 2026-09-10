import { json } from '@/lib/event-server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('bfsi_admin_session');
  return json({ success: true });
}
