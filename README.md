# GSC Insight Radar (No Localhost Needed)

Custom dashboard app for Google Search Console with daily sync, anomaly alerts, and business-focused traffic insights.

## What this gives you
- Auto daily pull from Search Console API
- Date-wise anomaly detection (drop/spike)
- Alert timeline with impact score
- Business-friendly dashboard UI
- Cloud deploy ready (Vercel + Supabase)

## 1) Setup Supabase (browser only)
1. Create a project in Supabase.
2. Open SQL Editor and run [`sql/schema.sql`](./sql/schema.sql).
3. Copy `Project URL` and `Service Role Key`.

## 2) Setup Google Search Console API
1. Create Google Cloud project.
2. Enable Search Console API.
3. Create Service Account.
4. Generate service account key (JSON).
5. In Search Console property settings, add that service account email as Owner/User.

## 3) Deploy on Vercel (no localhost)
1. Push this folder to GitHub.
2. Import repo in Vercel.
3. Add all variables from `.env.example`.
4. Deploy.

## 4) Cron sync auth
Vercel cron calls `/api/cron/sync` daily (3 AM UTC by default).
Set `CRON_SECRET`, then call cron endpoint with:

`Authorization: Bearer <CRON_SECRET>`

If using Vercel Cron only, you can set the same header via a secure scheduled job proxy or keep endpoint internal via project protections.

## API endpoints
- `GET /api/metrics` -> dashboard metrics + health score
- `GET /api/alerts` -> latest anomaly alerts
- `POST /api/cron/sync` -> pull latest GSC data + detect alerts

## Improve next
- Query-level and page-level anomaly tables
- Branded vs non-branded split
- Revenue-at-risk model using conversion inputs
- Slack/Email notifications
- Multi-property tenant auth
