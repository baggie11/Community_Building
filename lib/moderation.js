// -----------------------------------------------------------------------------
// Moderator access for the built-in admin backend (/moderate).
// SERVER ONLY — never import this from a client component.
// -----------------------------------------------------------------------------
import { cookies } from 'next/headers';
import { MOD_COOKIE } from './constants';

// Demo passcode. Override it with the MOD_PASSCODE environment variable
// (see .env.local.example) — that keeps the real value out of the source.
const MOD_PASSCODE = process.env.MOD_PASSCODE;

export async function isModUnlocked() {
  const store = await cookies();
  return store.get(MOD_COOKIE)?.value === '1';
}

export async function setModUnlocked(value) {
  const store = await cookies();
  if (value) {
    store.set(MOD_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });
  } else {
    store.delete(MOD_COOKIE);
  }
}

export function checkPasscode(value) {
  return typeof value === 'string' && value.trim() === MOD_PASSCODE;
}
