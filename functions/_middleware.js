const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'sha256-+najsTGHPLrsR7lLXlaM9S7qoU4LgA+glSlg0H3qd0k=' 'sha256-nx5OeDqWhLOqDOnlb4Mw1AlOxX8C1OEsmQKgx77jxyc=' 'sha256-OGwtN7pq4o7hAY8JNXuS9CDUT3+Y1SlqwSgbWAMvU/A=' 'sha256-F1R/zguiqb5x/2P3j8kRLaewBUTARaY7moiU5QY26lI=' 'sha256-2kCjzsNz3CC4W05OykXDYLnaOcLHoU9DarQ00LXXPOQ='; style-src 'self' 'sha256-kcFSTThznTZlsXhorwCMBANIuSW20mL9vLnIaIWYEK8=' 'sha256-GIv/XkwL8K4dTPMM90IXGLd9bj7cmdDv7DtsnIrVePc=' 'sha256-G6EseeFlqUiw1odmlYH9sIGcx63JjLUIgxUc6nv/V4o=' 'sha256-TH0uoOrZ8a2lFjcnnyjX4eNxFhOHfFN2Jalc5gWlVhI=' 'sha256-O55m7CW5M4p4yW86oA+1xZmTmNj27XdSeKZfC63P6lo='; img-src 'self'; font-src 'self' data:; connect-src 'self'; upgrade-insecure-requests",
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
