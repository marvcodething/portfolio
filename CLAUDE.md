# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Start production server
```

No test suite is configured.

## Architecture

Next.js 15 App Router portfolio site. All pages are `"use client"` components. Routes:

- `/` (`src/app/page.js`) — Animated landing page with a SWE/FILM mode toggle. Clicking "Enter →" routes to `/projects` (SWE mode) or `/film` (FILM mode).
- `/projects` — Project showcase with a featured section, "Cool Stuff I'm Building" cards, and a completed-projects carousel using `apple-cards-carousel`. All project data is hardcoded inline.
- `/film` — Film browser with a 3D rotating dial/wheel navigator. All film data is hardcoded inline in `CATEGORIES` and `films` arrays.
- `/resume` — Timeline of work experience using the `Timeline` component. All data is hardcoded inline.
- `/api/chat`, `/api/test-ai` — API route directories present but currently empty (no route handlers implemented).

Reusable UI components live in `src/components/ui/`: `apple-cards-carousel`, `floating-navbar`, `glare-card`, `timeline`, `tracing-beam`. These are Aceternity UI-style components.

## Styling

Tailwind CSS v3 with daisyui and `tailwindcss-animate`. Two named font utilities are registered:

- `font-abominable` — Abominable font (headlines, dial titles); loaded from `public/fonts/`
- `font-futura` — FuturaHeavy Cyrillic (UI labels, tracking text); loaded from `public/fonts/`
- Righteous (Google Font) — used only on the landing page via `next/font/google`

Two accent colors appear throughout:
- Orange `#f97316` / `text-orange-400` — FILM mode, film page
- Cyan `#22d3ee` / `text-cyan-400` — SWE mode, projects/resume pages

CSS variables for shadcn/ui theming are defined in `src/app/globals.css`. The `tailwind.config.mjs` exposes all Tailwind colors as CSS variables via a custom plugin.

## Key dependencies

- `framer-motion` — all page animations and hover effects
- `@supabase/supabase-js` — intended for RAG chatbot (pgvector)
- `@google/generative-ai` — intended for RAG chatbot (Gemini embeddings/generation)
- `@vercel/analytics` — included in root layout
- `@tabler/icons-react`, `lucide-react`, `react-icons` — icon sets used across pages
