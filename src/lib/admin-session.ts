import { env } from 'cloudflare:workers';
import { validateSession } from './admin-auth';

export const SESSION_COOKIE = 'lfd_admin';

export function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export async function isAuthed(cookieHeader: string | null): Promise<boolean> {
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  if (!token) return false;
  return validateSession((env as any).ADMIN_STORE, token);
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}
