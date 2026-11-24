import { json, isSameOrigin, getAdminContext, clearSessionCookie } from "../_utils.js";
export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: "Request origin rejected." }, 403, { "set-cookie": clearSessionCookie() });
  try {
    const context = await getAdminContext(request, env);
    if (!context.error) await fetch(`${context.url}/auth/v1/logout`, { method: "POST", headers: { apikey: context.key, Authorization: `Bearer ${context.session.access_token}` } });
  } catch {}
  return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
}
