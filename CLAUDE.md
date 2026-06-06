# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run lint       # ESLint check
npm run deploy     # build + publish to GitHub Pages (gh-pages)
```

No test suite exists in this project.

Set `VITE_EIA_API_KEY` in a `.env` file to fetch live EIA electricity rates. Without it, the app falls back to hardcoded rates in `src/data/states.js`.

## Architecture

**Data flow:** `App.jsx` is the single stateful root. It owns `selectedId` (location) and `config` (rack parameters), fetches all external data via two hooks, derives the current result with `calcMonthlyCost`, and passes props down to pure display components.

**External data:**
- `useEIA` (`src/hooks/useEIA.js`) — fetches commercial electricity rates ($/kWh) from EIA API v2. Converts from cents/kWh. Falls back to `FALLBACK_RATES` in `src/data/states.js` if no API key or request fails.
- `useAllTemperatures` (`src/hooks/useWeather.js`) — fetches 7-day average max temperature from Open-Meteo for all locations in parallel (concurrency limit: 10). Uses capital city coordinates from `src/data/states.js`.

**Cost model** (`src/utils/costCalc.js`):
- `effectivePUE(basePUE, avgTempC)` — adjusts PUE for ambient temperature. Baseline 20°C; +0.01 PUE per °C above, −0.005 per °C below.
- `calcMonthlyCost(config, ratePerKwh, avgTempC)` — returns full breakdown: IT energy, cooling overhead (PUE-derived), 8% facilities overhead, monthly/annual totals.

**El Salvador** is a special case (`EL_SALVADOR` in `src/data/states.js`) with hardcoded rate and temperature (no EIA entry, no weather fetch). It's treated identically to US states in all cost calculations.

**Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`). Custom theme tokens defined in `src/index.css` under `@theme`. Inline `style={{}}` props are used extensively alongside Tailwind utilities — both patterns coexist. Fonts: DM Sans (UI) and Space Mono (numeric/monospace values), loaded from Google Fonts in `index.html`.

**Chart:** `ComparisonChart.jsx` uses Chart.js via `react-chartjs-2`. It renders all locations as stacked bars (IT / Cooling / Overhead), collapsed by default. The selected location is highlighted with higher opacity bars.

## Domain rules

- **ALWAYS use USD ($) as the currency.** El Salvador has used the US dollar since 2001 — the colón is no longer in circulation. Never display or reference colones.
- Electricity rates are stored and passed as **$/kWh** throughout the codebase. Display conversions to ¢/kWh happen only at render time.
- Temperature penalty applies to PUE, not directly to cost. Always go through `effectivePUE` for any PUE calculation.
- Assume 30 days/month for all monthly calculations (hardcoded in `costCalc.js`).
