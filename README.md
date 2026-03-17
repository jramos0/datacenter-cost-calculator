# Datacenter Cost Calculator Dashboard

A **real-time cost analysis tool** for comparing datacenter electricity expenses across all 50 US states and El Salvador. Adjust rack configurations, ambient temperatures, and power metrics to see accurate monthly and annual cost breakdowns with live electricity rates.

## What This Site Does

This interactive dashboard helps datacenter operators and infrastructure planners:

- **Compare electricity costs** across any US state or El Salvador
- **Calculate facility operating costs** including IT energy, cooling overhead, and management expenses
- **Visualize cost distribution** with stacked bar charts (IT vs. cooling vs. overhead)
- **Understand PUE impact** with real-time effective PUE calculations adjusted for local temperature
- **Plan capacity** by adjusting rack count, power per rack, and operational uptime
- **Export cost insights** via visual charts and summary metrics

### Example Use Cases

- *Where should we build our next datacenter?* — Compare costs across states in real-time
- *How much cooling overhead do we actually need?* — See the PUE penalty for hot climates
- *Is El Salvador competitive?* — Check against US rates with their fixed $0.18/kWh tier
- *What's our true operating cost per kWh?* — Effective rate accounting for all overheads

---

## Key Features

### 1. **Real-Time Electricity Rates (US States)**
- Fetches **live commercial electricity rates** from the **EIA (Energy Information Administration) API v2**
- Covers all 50 states with **monthly updated rates** from actual utility data
- Falls back to 2024 hardcoded rates if the EIA API is unavailable
- Header badge shows `LIVE EIA RATES` or `ESTIMATED RATES` depending on data source

### 2. **El Salvador (Hardcoded)**
- Fixed rate: **$0.18/kWh** (manually maintained)
- Average temperature: **28°C** (tropical climate)
- **Why hardcoded?** El Salvador's rates are stable and government-regulated; using a hardcoded value ensures consistency and avoids unnecessary API calls. Update this value in `src/data/states.js` if rates change.
- Visually distinguished with teal accent color and El Salvador flag emoji

### 3. **Location Search & Sorting**
- Vertical scrollable list with **live search** by state name or abbreviation
- Always sorted **cheapest-first** (ascending by rate) — El Salvador appears where its rate dictates
- Search filters in real-time; non-matching locations disappear instantly
- Displays: state code · location name · average temp · rate ¢/kWh

### 4. **Rack Configuration Sliders**
- **Total Racks**: 1–500 (default: 20)
- **Power per Rack**: 1–50 kW (default: 10)
- **Base PUE**: 1.0–3.0 (default: 1.4)
  - Power Usage Effectiveness: ratio of total facility power to IT power
  - Higher = more cooling overhead
- **Uptime Hours/Day**: 1–24 hours (default: 24 for 24/7 operation)

### 5. **Temperature-Based PUE Penalty**
- Automatically fetches **7-day average max temperature** from Open-Meteo API (free, no key needed)
- Adjusts effective PUE based on ambient temperature:
  - Below 20°C: **cooling bonus** (free cooling benefit) — PUE decreases
  - Above 20°C: **cooling penalty** (AC overhead increases) — PUE increases
  - **Formula**: `effectivePUE = basePUE + max(0, (temp − 20) × 0.01)`
- Example: 28°C (El Salvador) adds +0.08 to base PUE

### 6. **Cost Breakdown Table**
Shows monthly costs split into:
- **IT Energy Cost**: Pure compute power consumption
- **Cooling Overhead Cost**: Energy for air conditioning, calculated as `(total − IT) × rate`
- **Other Overhead (8%)**: Facilities, management, UPS losses
- **Total Monthly & Annual**: Grand total with and without overheads

Visual energy distribution bar shows the percentage split between IT load and cooling.

### 7. **Comparison Chart**
- **Stacked bar chart** comparing monthly costs across all 51 locations (50 states + El Salvador)
- Sorted by total cost (cheapest on left, most expensive on right)
- Each bar shows three segments: IT energy (teal) · cooling (blue) · overhead (gray)
- Hover tooltips display full breakdown: rate, PUE, temperature
- Quick stats row shows cheapest and most expensive locations
- El Salvador row highlighted with teal accent and glow

### 8. **Summary Metrics Cards**
- **Monthly Cost**: Direct monthly expense in USD
- **Annual Cost**: Projected yearly cost
- **Rate $/kWh**: Commercial electricity rate for selected location
- **Effective PUE**: PUE adjusted for local temperature with penalty/bonus explanation

Visual PUE breakdown shows IT load vs. cooling as a percentage stacked bar.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 + custom CSS |
| **Charting** | Chart.js 4 + react-chartjs-2 |
| **HTTP** | Axios |
| **Real-Time Data** | EIA API v2 + Open-Meteo API |
| **Hosting** | GitHub Pages (gh-pages) |

### Dark Industrial Theme
- **Primary colors**: Deep navy (`#080d14`) background, slate gray text
- **Accent**: Teal (`#14b8a6`) for interactive elements and El Salvador
- **Monospace font**: Numbers and rates displayed in `Courier New` for readability
- **Visual feedback**: Glowing borders, smooth transitions, hover states

---

## API Requirements

### EIA (Energy Information Administration) — Commercial Electricity Rates
- **Endpoint**: `https://api.eia.gov/v2/electricity/retail-sales/data/`
- **Cost**: Free
- **Sign up**: https://www.eia.gov/opendata/register.php
- **Rate limit**: 120 requests/hour (more than enough)
- **Data**: Commercial sector rates by state, updated monthly

**Setup**:
1. Register at EIA OpenData
2. Copy your API key
3. Add to `.env`: `VITE_EIA_API_KEY=your_key_here`

If the key is missing or invalid, the app falls back to hardcoded 2024 rates automatically.

### Open-Meteo — Temperature Forecasts
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Cost**: Free (no key needed)
- **Rate limit**: 100k requests/day
- **Data**: 7-day forecast, average max temperature per location

Temperatures are fetched on app load for all 51 locations in batches (10 concurrent requests) to avoid rate limits.

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create .env file with your EIA API key
cp .env.example .env
# Edit .env and add your VITE_EIA_API_KEY

# Start dev server
npm run dev
# Opens at http://localhost:5173/datacenter-dashboard/

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```env
# .env (git-ignored)
VITE_EIA_API_KEY=your_eia_api_key_here

# If the key is missing or set to "YOUR_KEY", the app uses hardcoded fallback rates
```

---

## Deployment to GitHub Pages

1. **Update package.json homepage**:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/datacenter-dashboard"
   ```

2. **Ensure `.env` is in `.gitignore`** (it already is — don't commit API keys):
   ```
   .env
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```
   This runs `npm run build` and pushes `dist/` to the `gh-pages` branch.

4. **Enable GitHub Pages**:
   - Go to repo Settings → Pages
   - Set source to `gh-pages` branch
   - Save

Your dashboard will be live at: `https://YOUR_GITHUB_USERNAME.github.io/datacenter-dashboard/`

---

## Cost Calculation Formula

All costs are calculated monthly with this methodology:

```
IT Power (kW) = total_racks × kW_per_rack
IT Energy (kWh) = IT_power × uptime_hours/day × 30 days
Effective PUE = base_PUE + temperature_penalty
Total Energy (kWh) = IT_energy × effective_PUE
Cooling Overhead = Total_energy − IT_energy
IT Cost = IT_energy × electricity_rate
Cooling Cost = Cooling_overhead × electricity_rate
Other Overhead = (IT_cost + Cooling_cost) × 0.08
Monthly Total = IT_cost + Cooling_cost + Other_overhead
Annual Total = Monthly_total × 12
```

**Temperature Penalty Formula**:
```
penalty = max(0, (avg_temp_celsius − 20) × 0.01)
effective_PUE = base_PUE + penalty
```
- At 20°C: no adjustment
- At 25°C: +0.05 penalty
- At 28°C (El Salvador): +0.08 penalty
- Below 20°C: negative penalty = cooling bonus

---

## Project Structure

```
src/
├── App.jsx                        # Main app, state management
├── index.css                      # Tailwind + custom theme
├── data/states.js                 # All 50 states + El Salvador metadata
├── utils/costCalc.js              # Cost formulas and formatting functions
├── hooks/
│   ├── useEIA.js                  # Fetch live EIA rates
│   └── useWeather.js              # Fetch temperatures from Open-Meteo
└── components/
    ├── Header.jsx                 # Title + API status badge
    ├── LocationSelector.jsx       # Searchable, sorted location list
    ├── RackConfig.jsx             # Configuration sliders
    ├── SummaryCards.jsx           # 4 metric cards + PUE breakdown
    ├── CostBreakdown.jsx          # Cost table + energy distribution
    └── ComparisonChart.jsx        # Chart.js stacked bar chart
```

---

## Configuration & Customization

### Change El Salvador's Rate
Edit `src/data/states.js`:
```js
export const EL_SALVADOR = {
  id: 'SV',
  name: 'El Salvador',
  lat: 13.6929,
  lon: -89.2182,
  hardcodedRate: 0.18,  // Change this
  hardcodedTemp: 28,
  isSV: true,
}
```

### Adjust Slider Ranges
Edit `src/components/RackConfig.jsx`:
```jsx
<SliderRow
  label="Total Racks"
  value={config.racks}
  min={1} max={500} step={1}  // Modify these
  onChange={set('racks')}
/>
```

### Add a New Country/Region
1. Add entry to `src/data/states.js` with `isSV: true` flag if hardcoded
2. Add hardcoded rate and temperature
3. Include lat/lon for Open-Meteo API fallback
4. Update theme colors in `src/index.css` if needed

---

## Known Limitations

1. **El Salvador rate is static**: To keep the dashboard simple, El Salvador's rate is hardcoded at $0.18/kWh. Update manually when rates change.
2. **EIA API latency**: First load may take 2–3 seconds to fetch rates from the EIA API. Subsequent loads are cached in state.
3. **Temperature forecasts, not actuals**: Open-Meteo provides 7-day forecasts. For historical cost analysis, implement a real weather/historical data API.
4. **US states only**: Other countries are not supported (except El Salvador). To add more, see "Add a New Country/Region" above.
5. **No user accounts**: All calculations are client-side; no data is saved or synced across devices.

---

## Troubleshooting

### "ESTIMATED RATES" badge instead of "LIVE EIA RATES"
- Your EIA API key is missing or invalid
- Check `.env` file: `VITE_EIA_API_KEY=your_key`
- Verify the key on the [EIA OpenData dashboard](https://www.eia.gov/opendata/register.php)
- Fallback hardcoded rates will be used automatically

### Chart not loading or showing empty
- Wait 3–5 seconds for all location temperatures to load from Open-Meteo
- Check browser console (F12) for API errors
- El Salvador should always have data immediately (hardcoded temp)

### LocationSelector scrolling off screen
- The list has a fixed max height (`max-h-96`) with internal scrolling
- If it still causes layout issues, adjust the height in `LocationSelector.jsx`

---

## License

MIT

---

## Contributing

To add features or fix bugs:

1. Clone the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `npm run dev`
4. Build and verify: `npm run build`
5. Commit and push
6. Open a pull request

---

## Contact & Support

For questions or issues:
- **EIA API Support**: https://www.eia.gov/opendata/
- **Open-Meteo API Docs**: https://open-meteo.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **React Docs**: https://react.dev/
- **Vite Guide**: https://vite.dev/

Enjoy calculating! 📊⚡💰
