# DESIGN HANDOFF — HAUA GROUP

## Non-negotiable
Preserve the approved homepage design exactly. Do not redesign, restyle, simplify, replace, or reinterpret the UI. Internal refactoring is allowed only when rendered output remains visually identical. Ask before any design-related change.

## Visual direction
- Premium dark-luxury corporate identity: black/near-black, restrained gold, subtle green brand cues.
- Four homepage divisions: LAZEEZ Food, Rifa Aiman’s Attire, Ruhama Technology, WAHA AGRI.
- No buildings, offices, skyscrapers, or headquarters photography.
- No product imagery on the homepage; catalogues belong inside individual brand pages.

## Official logos
Original embedded logo image bytes have been extracted losslessly to `assets/brand-1.png` through `assets/brand-5.png`. Preserve their pixels and proportions. Do not redraw, recolor, crop, distort, or replace them.

## Product requirements
- Languages: English (default), Bengali, Arabic (RTL).
- Public site: company information and catalogues only. No cart, checkout, payments, or public customer accounts initially.
- Separate brand-scoped admin permissions; group admin manages all.
- Free-tier services only unless the user explicitly approves spending.
- No domain purchase without permission.

## Security requirements
- Server-side authorization for all privileged operations.
- Supabase RLS on every exposed table and storage policy for every bucket.
- Never expose service-role/secret keys to browser code.
- No public admin registration; provision admins through a trusted server-side flow.
- Validate inputs server-side, use secure session handling, least-privilege grants, and audit access rules.
- Run Supabase Security Advisor and functional authorization tests before release.

## Acceptance
Compare desktop and mobile rendering against the approved prototype. Report functional changes separately from visual changes. No visual changes without user approval.
