/**
 * authService.js
 * ──────────────
 * Handles all authentication API calls and token management.
 * JWT is stored in localStorage under the key "tm_token".
 */

const TOKEN_KEY = "tm_token";
const USER_KEY  = "tm_user";

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getToken()              { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token)         { localStorage.setItem(TOKEN_KEY, token); }
export function removeToken()           { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
export function getStoredUser()         { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
export function setStoredUser(user)     { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function isAuthenticated()       { return !!getToken(); }

// ── Fetch wrapper that injects the Bearer token ───────────────────────────────
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Auth API calls ────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ username, email, full_name, password, confirm_password }} formData
 */
export async function register(formData) {
  const data = await authFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data.user;
}

/**
 * Log in with username/email + password.
 * @param {{ username, password }} credentials
 */
export async function login(credentials) {
  const data = await authFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data.user;
}

/**
 * Log out — clears local storage and notifies the backend.
 */
export async function logout() {
  try {
    await authFetch("/api/auth/logout", { method: "POST" });
  } catch (_) {
    // Ignore errors; always clear local state
  } finally {
    removeToken();
  }
}

/**
 * Fetch the current user's profile from the backend.
 */
export async function getMe() {
  return authFetch("/api/auth/me");
}
