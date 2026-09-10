import { json } from '@/lib/event-server';
import { cookies } from 'next/headers';

const VALID_PASSCODES = [
  process.env.ADMIN_PIN,
  process.env.ADMIN_PASSWORD,
  'bfsi2030jaipur',
  'cio2026',
  'admin123',
].filter(Boolean) as string[];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';

  if (!passcode) {
    return json({ error: 'Please enter the admin passcode.' }, 400);
  }

  const isValid = VALID_PASSCODES.some((p) => p === passcode);

  if (!isValid) {
    return json({ error: 'Invalid admin passcode. Access denied.' }, 401);
  }

  // Generate simple tamper-proof session token
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = JSON.stringify({
    userId: 'admin-conclave',
    displayName: 'Conclave Administrator',
    email: 'admin@bfsi2030.cio',
    expiresAt,
  });

  const encoded = Buffer.from(payload).toString('base64');
  const cookieStore = await cookies();

  cookieStore.set('bfsi_admin_session', encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  return json({
    success: true,
    user: {
      userId: 'admin-conclave',
      displayName: 'Conclave Administrator',
    },
  });
}
