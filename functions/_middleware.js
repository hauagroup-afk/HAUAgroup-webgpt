const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'sha256-rrOKqdLt3TGuidzmxXUU0cByHyVP28Y6DIjHBkyQ3Ak=' 'self' 'sha256-NVquHOfq8b+hyVAvIH8FCCld1TcY9tbIfEmye0Vq/OA=' 'sha256-FXXcS1Upx7psr/mcNuEojuPzMfdP0QInBBW2sbXDTAs='; style-src 'sha256-7+u2DByYE/lQPrDvJ1uFJAytYcJNByqp34wbma8sqiY=' 'self' 'sha256-3xjrl+CQTFKfKuyJai/v05daMShnfJKGWwe5OEifsW8=' 'sha256-wa2rC+6WUfQvDqMn2mOVjQAI6jwrzUbpQUESmvBGQIw='; img-src 'self' https://*.supabase.co; font-src 'self' data:; connect-src 'self'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};
export async function onRequest({ request, next }) {
  const response = await next();
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  if (new URL(request.url).pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store, private");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
