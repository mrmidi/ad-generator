/**
 * API client for bandh-tools-backend.
 *
 * In dev mode, set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
 * In prod, the API runs on the same domain or set the production URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const TOKEN_KEY = 'bandh_api_token';
const USERNAME_KEY = 'bandh_username';

// ── Token management ──────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

// ── API calls ─────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<{ api_token: string; username: string }> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Ошибка авторизации');
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.api_token);
  localStorage.setItem(USERNAME_KEY, data.username);
  return data;
}

export async function fetchWithAuth(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(opts.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}

export async function fetchMe(): Promise<{
  admin_id: number;
  user_id: number;
  username: string;
  is_active: boolean;
} | null> {
  try {
    const res = await fetchWithAuth('/api/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function logout(): void {
  clearAuth();
  window.location.reload();
}

// ── Events API ────────────────────────────────────────────

export interface ChatEvent {
  id: number;
  chat_id: number;
  chat_title: string | null;
  telegram_chat_id: number | null;
  user_id: number | null;
  actor_id: number | null;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  date: string;
  created_at: string | null;
}

export async function fetchEvents(params?: {
  event_type?: string;
  telegram_chat_id?: number;
  limit?: number;
}): Promise<{ events: ChatEvent[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.event_type) query.set('event_type', params.event_type);
  if (params?.telegram_chat_id)
    query.set('telegram_chat_id', String(params.telegram_chat_id));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const res = await fetchWithAuth(`/api/events${qs ? `?${qs}` : ''}`);

  if (!res.ok) {
    throw new Error('Ошибка загрузки событий');
  }
  return await res.json();
}
