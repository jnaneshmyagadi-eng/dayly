# OMIGY

**Know what matters. Understand why. Decide together.**

Autonomous internet intelligence platform: DISCOVER → UNDERSTAND → DEBATE → DECIDE → SHARE.

## Production

- Vercel project: `dayly` (upgraded in place)
- Supabase: shared with OpinionX auth + OMIGY tables

## Features

- Live trend aggregation from public RSS feeds
- Clustering of related stories
- Source-grounded explanations (optional LLM enrichment)
- Public opinion polls with RLS
- Opportunity radar (official links only)
- Search, PWA, SEO, mobile-first UI
- Hourly ingest cron on Vercel

## Environment

See `.env.example`.

Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL

Optional: OPENAI_API_KEY, CRON_SECRET

## Local

npm install && npm run dev
curl http://localhost:3000/api/ingest
