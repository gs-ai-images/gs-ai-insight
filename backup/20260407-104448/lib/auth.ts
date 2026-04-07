import { cookies } from 'next/headers';

export function isAdmin(token: string | undefined): boolean {
  if (!token) return false;
  return token === process.env.ADMIN_PASSWORD || token === 'gsai2024admin';
}

export function generateUserToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
