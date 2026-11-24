const COOKIE = "__Host-haua_session";
const MAX_SESSION_AGE = 60 * 60 * 24 * 30;

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, private",
      "x-content-type-options": "nosniff",
      ...extra,
    },
  });
}
export function noStoreHeaders() {
  return { "cache-control": "no-store, private", "pragma": "no-cache" };
}
export function isSameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !!origin && origin === new URL(request.url).origin;
}
function encode(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function decode(value) {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}
export function sessionCookie(session) {
  const value = encode(session);
  return `${COOKIE}=${value}; Path=/; Max-Age=${MAX_SESSION_AGE}; HttpOnly; Secure; SameSite=Strict`;
}
export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
function readCookie(request) {
  const raw = request.headers.get("Cookie") || "";
  const item = raw.split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
  return item ? decode(item.slice(COOKIE.length + 1)) : null;
}
function config(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) throw new Error("Server configuration is incomplete.");
  return { url: env.SUPABASE_URL.replace(/\/$/, ""), key: env.SUPABASE_PUBLISHABLE_KEY };
}
async function authFetch(url, key, token) {
  return fetch(url, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
}
export async function getAdminContext(request, env) {
  const { url, key } = config(env);
  let session = readCookie(request);
  if (!session?.access_token || !session?.refresh_token) return { error: "unauthorized" };
  let setCookie = null;
  if (!session.expires_at || session.expires_at <= Math.floor(Date.now() / 1000) + 60) {
    const refreshed = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!refreshed.ok) return { error: "unauthorized", clearCookie: clearSessionCookie() };
    const next = await refreshed.json();
    session = { access_token: next.access_token, refresh_token: next.refresh_token, expires_at: next.expires_at || Math.floor(Date.now()/1000) + next.expires_in };
    setCookie = sessionCookie(session);
  }
  const userResponse = await authFetch(`${url}/auth/v1/user`, key, session.access_token);
  if (!userResponse.ok) return { error: "unauthorized", clearCookie: clearSessionCookie() };
  const user = await userResponse.json();
  const profileResponse = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,display_name,role,company_id,is_active`, {
    headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, Accept: "application/json" },
  });
  if (!profileResponse.ok) return { error: "forbidden", clearCookie: clearSessionCookie() };
  const profiles = await profileResponse.json();
  const profile = profiles[0];
  if (!profile || !profile.is_active || !["group_admin", "company_admin"].includes(profile.role)) {
    return { error: "forbidden", clearCookie: clearSessionCookie() };
  }
  return { url, key, session, user, profile, setCookie };
}
export function authResponse(data, context, status = 200) {
  const headers = {};
  if (context?.setCookie) headers["set-cookie"] = context.setCookie;
  if (context?.clearCookie) headers["set-cookie"] = context.clearCookie;
  return json(data, status, headers);
}
export async function supabaseRequest(context, path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("apikey", context.key);
  headers.set("Authorization", `Bearer ${context.session.access_token}`);
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return fetch(context.url + path, { ...options, headers });
}
export function validText(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}
