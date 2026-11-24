import { json, getAdminContext, authResponse } from "../_utils.js";
export async function onRequestGet({ request, env }) {
  try {
    const context = await getAdminContext(request, env);
    if (context.error) return authResponse({ error: context.error }, context, context.error === "unauthorized" ? 401 : 403);
    return authResponse({ ok: true, profile: context.profile }, context);
  } catch { return json({ error: "Authentication service unavailable." }, 503); }
}
