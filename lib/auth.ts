import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, hasUser } from './db';

const COOKIE_NAME = 'tt_session';
const secret = process.env.SESSION_SECRET || 'dev-secret-change-me';

function sign(value: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function makeToken() {
  const payload = `${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string) {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export function userExists() {
  return hasUser();
}

export async function setPassword(password: string) {
  const hash = await bcrypt.hash(password, 12);
  db.prepare('INSERT OR REPLACE INTO users(id, passwordHash) VALUES (1, ?)').run(hash);
}

export async function verifyPassword(password: string) {
  const user = db.prepare('SELECT passwordHash FROM users WHERE id = 1').get() as { passwordHash: string } | undefined;
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function login() {
  const token = makeToken();
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAuthenticated() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : false;
}

export async function requireAuth() {
  if (!(await isAuthenticated())) redirect('/auth/login');
}
