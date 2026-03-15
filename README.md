# RiskNexus - Civilian Conflict Early Warning MVP

RiskNexus is a hackathon MVP focused on one mission:
**real-time conflict heatmaps that warn civilians before danger reaches them.**

It turns scattered warning signals into a clear, layered flow:
1. Global overview of active alerts
2. Conflict heatmap showing danger concentration
3. Zone-level details for local warning context
4. Alert detail explaining why it matters
5. Alert spread simulation for neighboring-zone escalation

## Why It Matters

In fast-moving conflicts, warning signals appear before severe harm, but they are fragmented.
RiskNexus helps responders and communities:
- identify where danger is rising
- estimate where warning lead-time is shrinking
- understand confidence in each alert
- anticipate cascading impact on civilian services

## SDG Relevance

- SDG 11 - Sustainable Cities and Communities
- SDG 16 - Peace, Justice and Strong Institutions
- SDG 3 - Good Health and Well-Being

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- TailwindCSS
- Mapbox GL JS + automatic MapLibre fallback (no token required)
- Recharts
- react-force-graph-2d

## Data Model (Simulated for MVP)

Signals are mock events with:
- `type`
- `severity`
- `timestamp`
- `location`

Risk and confidence are recalculated continuously from:
- signal density
- severity
- recency
- corroboration agreement
- neighboring zone consistency

## Local Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Optional Mapbox Token

Map works without a token using MapLibre fallback.
If you want Mapbox tiles, add:

```bash
cp .env.example .env.local
```

Then set:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token
```

## Deploy on Vercel

1. Push repository to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Deploy (no required env vars)
4. Optional: add `NEXT_PUBLIC_MAPBOX_TOKEN` later

## Key Directories

- `app/` - pages (overview, map, region, signal, cascade)
- `components/` - UI, map, charts, graphs, providers
- `lib/` - simulation, scoring, cascade, constants, types
- `hooks/` - utility hooks
