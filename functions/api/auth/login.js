import { json, isSameOrigin, sessionCookie, authResponse } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: "Request origin rejected." }, 403);
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 8000) return json({ error: "Login request is too large." }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body) || JSON.stringify(body).length > 8000) return json({ error: "Invalid request." }, 400);
  if (typeof body.email !== "string" || body.email.length > 254 || typeof body.password !== "string" || body.password.length < 8 || body.password.length > 256) {
    return json({ error: "Enter a valid email and password." }, 400);
  }
  const url = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return json({ error: "Authentication service is not configured." }, 503);
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "content-type": "application/json" },
    body: JSON.stringify({ email: body.email.trim().toLowerCase(), password: body.password }),
  });
  if (!response.ok) return json({ error: "Email or password is incorrect, or this account is unavailable." }, 401);
  const data = await response.json();
  const profileResponse = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(data.user.id)}&select=id,display_name,role,company_id,is_active`, {
    headers: { apikey: key, Authorization: `Bearer ${data.access_token}`, Accept: "application/json" },
  });
  const profiles = profileResponse.ok ? await profileResponse.json() : [];
  const profile = profiles[0];
  if (!profile || !profile.is_active || !["group_admin", "company_admin"].includes(profile.role) || (profile.role === "company_admin" && !profile.company_id)) {
    await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${data.access_token}` } });
    return json({ error: "This account has no active administrator access." }, 403);
  }
  const session = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at || Math.floor(Date.now()/1000) + data.expires_in };
  return json({ ok: true, profile }, 200, { "set-cookie": sessionCookie(session) });
}
