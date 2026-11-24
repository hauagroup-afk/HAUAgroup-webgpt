# Cloudflare Pages deployment

This repository is designed for Cloudflare Pages with Pages Functions.

## Build settings
- Framework preset: None
- Build command: leave empty
- Build output directory: `.` (repository root)
- Production branch: `main`

## Required environment variables
Add these in Cloudflare Pages → Settings → Variables and Secrets, for both Production and Preview:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` = the project's publishable key

Do not add a service-role or secret API key. The current server functions use the publishable key together with user access tokens and RLS.

## Important
Do not deploy until the variables are configured. The site can render without them, but live catalogue, inquiry, and admin endpoints will return a configuration error.
