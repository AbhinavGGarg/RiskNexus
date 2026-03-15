# RiskNexus - Global Risk Intelligence MVP

RiskNexus is a hackathon-ready intelligence dashboard built with Next.js that helps users detect emerging global risks and explore cascading impacts across interconnected systems.

The app is aligned with:
- SDG 9 - Industry, Innovation and Infrastructure
- SDG 11 - Sustainable Cities and Communities
- SDG 13 - Climate Action
- SDG 16 - Peace, Justice and Strong Institutions

## Core Experience

Layered exploration flow:
1. Overview dashboard with global metrics, heatmap signals, and activity feed
2. Signals Map for region-level risk and confidence scanning
3. Region Details with focused risk context and clickable signal cards
4. Signal Detail with causes, SDG tags, impact pathways, and dependency graph
5. Cascade Explorer with ripple animation, time-step propagation, and affected region impacts

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- TailwindCSS
- Mapbox GL JS
- Recharts
- react-force-graph-2d

## Simulation Design

The MVP uses simulated data and periodic updates:
- Signal timeline frames generated every 15 simulated minutes
- Live mode appends new frames automatically
- Event Replay Mode lets users scrub historical frames with a timeline slider
- Region risk and confidence are recalculated from signal density, severity, recency, agreement, and neighbor consistency

## Getting Started Locally

1. Install dependencies:

```bash
npm install
```

2. Add environment variables:

```bash
cp .env.example .env.local
```

Then set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`.

3. Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build and Run Production Locally

```bash
npm run build
npm run start
```

## Deploy on Vercel

1. Push this folder to a Git repository.
2. Import the project in [Vercel](https://vercel.com/new).
3. Set environment variable `NEXT_PUBLIC_MAPBOX_TOKEN` in Vercel project settings.
4. Deploy.

Vercel will automatically run `npm install` and `npm run build`.

## Project Structure

- `app/` - App Router pages (`overview`, `map`, `region`, `signal`, `cascade`)
- `components/` - reusable UI, map, graph, chart, and provider components
- `lib/` - simulation logic, scoring model, cascade model, typed constants
- `hooks/` - small client-side utility hooks

## Notes

- The map works without backend services using mock signal generation.
- If no Mapbox token is present, the app shows a graceful message in map panels.
