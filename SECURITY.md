# Security policy — HAUA GROUP

## Access model
- Public visitors can read active company profiles, active categories, published products, and published site content.
- Public visitors can submit inquiries and guest COD orders only through validated server endpoints. Guest order writes use a server-side Supabase secret key; it is never sent to browsers.
- Administrators sign in through the private /admin/ portal. There is no public registration.
- Every privileged request revalidates the Supabase Auth user and reads the administrator profile from the database. User-editable metadata is never used for authorization.
- Company administrators are scoped to their assigned company. Group administrators have group-wide scope. Supabase RLS remains the final authorization boundary.

## Secrets and sessions
- Only the Supabase project URL and publishable key are used by the application.
- No service-role or secret key is present in browser code or this repository.
- Admin access and refresh tokens are stored in a Secure, HttpOnly, SameSite=Strict, host-only cookie.
- Mutating browser requests require a same-origin Origin header.
- API responses are marked private/no-store.

## Deployment requirements
Set these Cloudflare Pages environment variables:
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY

Never add service-role keys, database passwords, access tokens, or user credentials to GitHub, client-side code, or build logs.

## Before production launch
- Provision administrators through a trusted private process. Customer sign-up may be enabled, but customer signup must never grant administrator roles.
- Verify Supabase Auth email/password policy, MFA availability, password strength, and rate limits.
- Run Supabase Security Advisor and test anonymous, company-admin, and group-admin access separately.
- Add Turnstile or an equivalent abuse-control layer to public inquiry submission if spam appears.
- Review CSP and all response headers against the final deployed host.
- Perform dependency, endpoint, RLS, and mobile/desktop functional testing.
