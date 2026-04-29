# CarTrack — Family Vehicle Manager

A client-side-only web app for households with multiple cars to keep track of
expenses, insurance, Cartea Verde (international green-card insurance), and
technical inspection schedules — all in one place, with no backend.

> University Lab 6 — Front-end. Built with React, Vite, and TypeScript. Hosted
> on GitHub Pages.

## Public link

The deployed app lives at:

**https://andreiceaetchii.github.io/WEB_LAB6/**

## Features

- 🚘 **Garage** — add cars with make, model, year, VIN, license plate, and a
  registration photo. Mark a car as favorite. Filter the grid by favorites or
  search by make/model/plate/VIN.
- 💸 **Expenses** — record fuel, repair, parts, technical inspection, and
  miscellaneous (car wash, road tax, accessories…) spending per car. Filter by
  car or category; running total updates live.
- 📋 **Insurance (RCA)** — start/end date, insurer, policy number, cost, plus
  a multi-photo gallery of the document itself. Validity badges: Active /
  Expiring soon / Expired. Tap a thumbnail to open a full-screen lightbox.
- 📗 **Cartea Verde** — same flow as insurance, separate page for
  international coverage cards.
- 📊 **Dashboard** — donut of total spend per car (each car gets a unique
  auto-assigned accent color), 12-month spending trend, an alerts strip for
  documents expiring within 30 days, and quick stats.
- ⚡ **Quick add** — a header dropdown that lets you add a car, record an
  expense, or attach an RCA / Cartea Verde from any page.
- 🌗 **Light / dark theme** — persisted across reloads, respects
  `prefers-color-scheme` on first visit.
- 💾 **Offline-first** — cars, expenses, documents, and photos are stored in
  IndexedDB; theme preference in localStorage. Photos are compressed to WebP
  in the browser before storage.
- 📤 **JSON export / import** — back up your garage (photos included) and
  restore it on another device. There's also a "wipe all data" danger zone.

## App flows

1. **First visit** → land on the dashboard with empty-state copy. Toggle
   theme from the header; preference is remembered on reload.
2. **Add a car** → Quick add menu, _Garage_ "+", or empty-state CTA. Fill
   make / model / year / plate / VIN; optionally upload a photo of the
   registration document. The car gets an auto-assigned accent color from a
   curated 8-color palette so the dashboard donut reads cleanly.
3. **Record an expense** → Quick add menu, _Expenses_ "+", or the per-car
   detail page. Pick category (fuel, repair, parts, inspection, other). The
   form adapts: fuel asks for liters and price/L; repair asks for description
   and mechanic; etc.
4. **Add insurance / Cartea Verde** → either dedicated page, the Quick add
   menu, or the per-car detail page. Fill dates and insurer; upload up to 8
   photos of the policy. The row shows a status badge based on the end date.
5. **Open the lightbox** → tap any document's photo thumbnail. Arrow keys
   navigate; you can delete individual photos in-place.
6. **Dashboard updates automatically** — donut, trend, and alerts strip all
   re-render. Click a donut segment to drill into that car.
7. **Backup** → _Settings_ → _Export JSON_. Restore later with _Import JSON_.
   _Wipe all data_ is in the danger zone.

## Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** with class-based dark mode and custom design tokens
- **react-router-dom v6** with **HashRouter** (refresh-safe on GitHub Pages)
- **Zustand** — lightweight per-entity stores (`cars`, `expenses`,
  `documents`, plus a `ui` slice driving the Quick add menu)
- **idb** — IndexedDB wrapper with versioned schema migrations (cars added
  in v2, expenses in v3, documents in v4)
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
├─ lib/         # db, photos, theme, palette, validity, analytics,
│               # backup, format, types, useObjectUrl
├─ stores/      # Zustand slices: cars, expenses, documents, ui
├─ components/  # Layout, SideNav, ThemeToggle, Logo, QuickAddMenu,
│               # Modal, PhotoUpload, MultiPhotoUpload, PhotoLightbox,
│               # CarForm/CarCard, ExpenseForm/ExpenseRow,
│               # DocumentForm/DocumentRow/DocumentList,
│               # SpendDonut, MonthlyTrend, EmptyState, …
└─ pages/       # Dashboard, Garage, CarDetail, Expenses,
                # Insurance, CarteaVerde, Settings, NotFound
```

## How the work was structured

Six stacked feature PRs, each demonstrable end-to-end:

1. **Foundation** — Vite + React + Tailwind shell with light/dark theme,
   IndexedDB schema bootstrap, and GitHub Pages deploy wired up from day one.
2. **Car Garage** — DB v2 + cars Zustand store, custom designed logo +
   typography, CRUD with photo upload and favorite toggle.
3. **Expense Tracking** — DB v3 + discriminated expense union (fuel, repair,
   parts, inspection, other), per-car expenses tab, cascade delete.
4. **Documents** — DB v4 + unified `VehicleDocument` with `kind`
   discriminator, multi-photo gallery, validity badges, and a Quick add
   header menu for friendlier UX.
5. **Dashboard Analytics** — Recharts-powered donut and monthly trend, with
   alerts and quick stats.
6. **Filters, Export & Polish** — Garage filtering, JSON backup/restore,
   Settings page, README finalization.

## License

Educational project — no license claimed.
