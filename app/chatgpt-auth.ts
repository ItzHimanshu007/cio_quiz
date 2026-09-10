import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = 'oai-authenticated-user-id';
const USER_EMAIL_HEADER = 'oai-authenticated-user-email';
const USER_FULL_NAME_HEADER = 'oai-authenticated-user-full-name';
const USER_FULL_NAME_ENCODING_HEADER = 'oai-authenticated-user-full-name-encoding';
const PERCENT_ENCODED_UTF8 = 'percent-encoded-utf-8';

const VALID_PASSCODES = [
  process.env.ADMIN_PIN,
  process.env.ADMIN_PASSWORD,
  'bfsi2030jaipur',
  'cio2026',
  'admin123',
].filter(Boolean) as string[];

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  // 1. Check HTTP-only admin session cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('bfsi_admin_session')?.value;
    if (sessionCookie) {
      const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
      const data = JSON.parse(decoded);
      if (data && data.expiresAt > Date.now()) {
        return {
          userId: data.userId || 'admin-conclave',
          displayName: data.displayName || 'Conclave Administrator',
          email: data.email || 'admin@bfsi2030.cio',
          fullName: data.displayName || 'Conclave Administrator',
        };
      }
    }
  } catch {}

  // 2. Check header-based admin authentication (x-admin-pin or Authorization: Bearer <pin>)
  const requestHeaders = await headers();
  const adminPinHeader = requestHeaders.get('x-admin-pin') || requestHeaders.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (adminPinHeader && VALID_PASSCODES.includes(adminPinHeader.trim())) {
    return {
      userId: 'admin-conclave',
      displayName: 'Conclave Administrator',
      email: 'admin@bfsi2030.cio',
      fullName: 'Conclave Administrator',
    };
  }

  // 3. Check ChatGPT OAuth headers if present
  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (userId && email) {
    const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
    const fullName =
      encodedFullName &&
      requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
        ? safeDecodeURIComponent(encodedFullName)
        : null;

    return {
      userId,
      displayName: fullName ?? email,
      email,
      fullName,
    };
  }

  // No authenticated admin session found
  return null;
}

export async function requireChatGPTUser(returnTo = '/admin'): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  const safeReturn = safeRelativeReturnPath(returnTo);
  redirect(`/admin/login?return_to=${encodeURIComponent(safeReturn)}`);
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/admin';
  return value;
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
