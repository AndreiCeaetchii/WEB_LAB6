# CarTrack — Family Vehicle Manager

A client-side-only web app for households with multiple cars to keep track of
expenses, insurance, Cartea Verde (international green-card insurance), and
technical inspection schedules — all in one place, with no backend.

> University Lab 6 — Front-end. Built with React, Vite, and TypeScript. Hosted
> on GitHub Pages.

## Public link

The deployed app lives at:

**https://andreiceaetchii.github.io/WEB_LAB6/**

## Features (final scope)

- 🚘 **Garage** — add cars with make, model, year, VIN, license plate, and a
  registration photo. Mark a car as favorite.
- 💸 **Expenses** — record fuel, repair, parts, and technical inspection
  spending per car, filterable by category and date.
- 📋 **Insurance (RCA)** — start/end date, insurer, policy number, cost, plus
  a multi-photo gallery of the document itself. Active / expiring / expired
  badges.
- 📗 **Cartea Verde** — same flow as insurance, separate page for
  international coverage cards.
- 📊 **Dashboard** — donut of total spend per car (each car gets a unique
  auto-assigned accent color), monthly trend chart, and an alerts strip for
  documents expiring this or next month.
- 🌗 **Light / dark theme** — persisted across reloads, respects
  `prefers-color-scheme` on first visit.
- 💾 **Offline-first** — cars, expenses, documents, and photos are stored in
  IndexedDB; theme preference in localStorage.
- 📤 **JSON export / import** — back up your garage and restore it on another
  device.

## App flows (high level)

1. **First visit** — user lands on the dashboard with empty-state copy.
2. **Add a car** → Garage → "+" → fill make/model/VIN/plate, optionally upload
   a photo of the registration document.
3. **Add an expense** → Expenses → pick a car → choose category (fuel, repair,
   parts, inspection) → save.
4. **Add insurance** → Insurance → "+" → pick a car, fill dates, upload one or
   more photos of the policy. The page badges it as Active, Expiring, or
   Expired based on the end date.
5. **Add Cartea Verde** → same flow, separate page.
6. **Dashboard** updates automatically — donut shows spend per car (color
   coded), trend chart shows monthly totals, alerts strip surfaces anything
   expiring within 30 days.
7. **Backup** — Settings → Export JSON. Restore on another device with
   Import JSON.

## Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — class-based dark mode, custom design tokens
- **react-router-dom** v6 with **HashRouter** (refresh-safe on GitHub Pages)
- **Zustand** — lightweight per-entity stores
- **idb** — IndexedDB wrapper with versioned schema migrations
- **Recharts** — donut + monthly trend chart
- **react-hot-toast** — transient notifications
- Photos compressed to WebP via canvas, stored as `Blob` (not base64)
- GitHub Actions deploys `dist/` to GitHub Pages on every push to `main`

## Local development

```bash
npm install
npm run dev      # http://127.0.0.1:5173/WEB_LAB6/
npm run build    # production build into dist/
npm run preview  # preview the production build locally
npm run lint     # ESLint
```

## Project layout

```
src/
├─ lib/         # db (idb), photos (compress), theme, types, palette,
│               # validity, analytics, backup
├─ stores/      # Zustand slices: cars, expenses, documents
├─ components/  # Layout, SideNav, ThemeToggle, forms, lightbox, etc.
└─ pages/       # Dashboard, Garage, Expenses, Insurance, CarteaVerde,
                # Settings, NotFound
```

## Roadmap (PRs)

This project ships in 6 stacked feature PRs, each targeting the previous
branch:

1. **Foundation** — Vite + React + Tailwind shell with theme toggle and
   GitHub Pages deploy *(this PR)*
2. **Car Garage** — vehicle CRUD with photo upload and favorite toggle
3. **Expense Tracking** — fuel, repair, parts, and inspection records
4. **Documents** — RCA insurance and Cartea Verde with multi-photo gallery
5. **Dashboard Analytics** — per-car spending donut, monthly trends, alerts
6. **Filters, Export & Polish** — global filters, JSON backup/restore, final
   accessibility pass

## License

Educational project — no license claimed.
