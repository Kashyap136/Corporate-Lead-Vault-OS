// Central API helper. All backend requests must go through apiUrl() so they
// target the deployed backend (NEXT_PUBLIC_API_URL) instead of the local dev
// server. The base must not include /api — it is added here exactly once.

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');

// Builds an absolute backend URL from a backend path such as '/api/auth/login'.
// Guarantees exactly one '/api/' prefix and survives accidental trailing
// slashes on the base. Falls back to a same-origin relative path only when
// NEXT_PUBLIC_API_URL is unset (the app is then served through the Next.js
// rewrites, which proxy /api to the backend configured at build time).
export function apiUrl(path = '') {
  const cleanBase = API_BASE.replace(/\/api$/i, '');
  const cleanPath = (path || '').replace(/^\/+/, '');
  return cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
}

// Thin fetch wrapper used by authenticated pages. Attaches the JWT stored by
// the login/signup flow and redirects to /login when a request is unauthorized.
export async function authFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = typeof window !== 'undefined' && localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(url), { ...options, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.clear();
    window.location.href = '/login';
    return res;
  }

  return res;
}