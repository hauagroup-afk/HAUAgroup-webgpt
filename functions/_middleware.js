const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'sha256-LR8/4tJZKKON6Pj3OGy/KafJxytOlnQ+b0fhvuE1l3c=' 'sha256-arQRlxiGr2gWt1qpWUMEiFB7tfMSzkf/H0gQnfBpcHo='; style-src 'self' 'sha256-KgBRnBKxw/cLTjMgPiQwfG2f44YUi/SkZaBG6OY7CaE=' 'sha256-GIv/XkwL8K4dTPMM90IXGLd9bj7cmdDv7DtsnIrVePc='; img-src 'self' https://*.supabase.co; font-src 'self' data:; connect-src 'self'; upgrade-insecure-requests",
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
