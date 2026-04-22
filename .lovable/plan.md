
# What Is My IP — Plan

A fast, minimal single-page web app that instantly shows the visitor's public IP and connection details.

## Page layout (single route `/`)

**Header**
- Small wordmark "What Is My IP" (left), dark mode toggle (right).

**Hero card (centered, max-w-2xl)**
- `H1`: "Your public IP address"
- Huge mono IP display (IPv4), with a secondary line for IPv6 if available.
- Two buttons side-by-side: **Copy IP** (with check animation on success) and **Refresh** (spin icon while loading).
- Skeleton shimmer covers the IP and rows while data loads.

**Details grid (2 columns on desktop, 1 on mobile)**
Each item is a labeled row with an icon:
- Location — City, Region, Country (with flag emoji)
- ISP / Organization
- Connection type — VPN / Proxy / Tor / Hosting badges (color-coded: red if detected, green "Not detected" otherwise)
- Timezone
- Device — Mobile / Desktop / Tablet
- Browser — Name + version
- OS — Name + version
- IPv6 — shown if detected, else "Not available"

**Map preview (optional, below grid)**
- Static map tile centered on lat/long using a free provider (OpenStreetMap static image), with a pin. Lazy-loaded.

**Footer actions**
- "Copy all details" button → copies a formatted text block to clipboard.
- Tiny footer line: data source attribution.

## Data sources

- **Primary IP + geo + ISP + privacy flags**: `ipapi.co/json/` (free, no key, returns city, country, org, asn, and limited proxy info).
- **Privacy/VPN/Proxy/Tor detection fallback**: `ipwho.is/` or `ipapi.co`'s `security` fields where available. Tor detection limited to what the API provides — flagged honestly as "best-effort" in a tooltip.
- **IPv6**: separate call to `https://api64.ipify.org?format=json` to get IPv6 when the client supports it; IPv4 from `https://api.ipify.org?format=json` as a fast first paint while the richer call resolves.
- **Device / Browser / OS**: parsed client-side from `navigator.userAgent` + `navigator.userAgentData` (no extra request).

Strategy: fire IPv4 + details requests in parallel on mount; render IP the moment ipify responds (sub-200ms typically), fill in the rest as ipapi resolves. React Query handles caching and the Refresh button.

## UX details

- **Loading**: skeleton blocks for every value; the IP skeleton is the largest.
- **Errors**: if API fails, show a friendly inline error with a Retry button; never a blank screen.
- **Copy feedback**: button morphs to "Copied ✓" for 1.5s, plus a toast.
- **Animations**: fade-in + slight upward translate for the card on mount; row values fade in as data arrives; hover lift on buttons.
- **Responsive**: mobile-first, single column under 640px, comfortable tap targets.

## Design system

- Modern, Stripe/Vercel-inspired: lots of whitespace, subtle borders, soft shadows, mono font for the IP.
- Light + dark themes via `next-themes`-style toggle (class-based, persisted in localStorage). Update `index.css` tokens so dark mode looks intentional (deep slate background, soft white text, muted borders).
- Mono font (JetBrains Mono via Google Fonts) for IPs; Inter for UI text.

## SEO

- Update `index.html`:
  - `<title>What Is My IP? Check Your IP Address Instantly</title>`
  - Meta description, OG tags, canonical.
- Semantic structure: `<header>`, `<main>`, `<h1>`, `<h2>` for sections, `<footer>`.

## Tech notes

- React + Vite + Tailwind + shadcn (existing stack — Next.js isn't used in Lovable; the SPA serves the same purpose and is Vercel-deployable).
- New files:
  - `src/pages/Index.tsx` — page composition
  - `src/components/IpCard.tsx` — hero IP + actions
  - `src/components/DetailsGrid.tsx` + `DetailRow.tsx`
  - `src/components/PrivacyBadges.tsx`
  - `src/components/MapPreview.tsx`
  - `src/components/ThemeToggle.tsx`
  - `src/hooks/useIpInfo.ts` — React Query hook orchestrating the API calls
  - `src/lib/ua.ts` — user-agent parsing helpers
  - `src/lib/format.ts` — copy-all formatter
- Tweak `src/index.css` dark theme tokens; load Inter + JetBrains Mono in `index.html`.

## Out of scope

- No backend, no auth, no analytics, no rate-limit handling beyond a friendly retry.
