# HAUA GROUP — Master Development & Security Checklist

Target: premium, accessible, maintainable corporate digital platform. Security target: OWASP ASVS Level 2 where applicable; verify before claiming compliance. Free-tier-first; no spending without approval.

## Phase 1 — Foundation & Security
- [ ] Cloudflare Pages environment variables and server-only secret configured
- [ ] Auth, session, password recovery, email verification reviewed
- [ ] RLS verified on all exposed tables
- [ ] Server-side authorization for privileged actions
- [ ] Customer and admin roles separated
- [ ] Brand/company data boundaries verified
- [ ] API input validation, rate limits and abuse protections
- [ ] Security headers, CSP and origin/CSRF controls reviewed
- [ ] Secret scanning; keys never in browser or Git
- [ ] Security Advisor and access tests run

## Phase 2 — Premium Frontend
- [x] Homepage brand order: Ruhama Technology, LAZEEZ Food, Rifa Aiman's Attire, WAHA AGRI
- [x] Apparel logo display frame with white background
- [x] HAUA GROUP official logo positioned in site header
- [ ] Responsive visual audit on mobile, tablet and desktop
- [ ] EN/BN/AR translations reviewed; Arabic RTL verified
- [ ] Accessibility and contrast audit
- [ ] Performance/Core Web Vitals audit

## Phase 3 — Customer & Commerce
- [ ] Customer signup, verification, login, logout and password reset tested
- [ ] Customer profile and address management
- [ ] Guest COD checkout
- [ ] Server-calculated pricing, totals and order snapshots
- [ ] Order confirmation and status tracking
- [ ] Customer isolation tests
- [ ] Inventory controls and concurrency checks (when implemented)

## Phase 4 — Admin & Operations
- [ ] Group admin and brand-scoped admin access
- [ ] Product/category management
- [ ] Order management and status transitions
- [ ] Customer support and inquiry management
- [ ] Content/language management
- [ ] Analytics and reporting
- [ ] Admin audit logs

## Phase 5 — Audit & Launch
- [ ] Automated functional and regression tests
- [ ] OWASP-oriented security testing
- [ ] Dependency and secret scanning
- [ ] Backup and restore exercise
- [ ] Error monitoring and privacy-safe logs
- [ ] Deployment rollback/recovery plan
- [ ] Browser and mobile testing
- [ ] Privacy, terms, shipping, returns and contact policies reviewed
- [ ] Final launch checklist signed off

## Future (not currently in scope)
- Online payment gateway, SMS/WhatsApp notifications
- Coupons, reviews, wishlist, advanced CRM/analytics
- PWA/offline capabilities, multi-warehouse, AI support
