---
name: cost-modeling
description: Use when modifying, reviewing, or validating the data center cost model, including rack power, IT energy, PUE, cooling energy, electricity rates, overhead, monthly and annual totals, and related UI summaries.
---

# Cost Modeling

## Scope

Use this skill for changes that affect the calculator's numeric model, assumptions, cost breakdowns, units, or user-facing cost summaries.

Relevant project areas:

- `src/utils/costCalc.js` for core formulas and formatters.
- `src/components/RackConfig.jsx` for user inputs and derived power summaries.
- Cost display components such as `CostBreakdown.jsx`, `SummaryCards.jsx`, and `ComparisonChart.jsx`.
- Data hooks that provide model inputs, especially electricity rates and weather data.

## Workflow

1. Read the current formula source before changing assumptions.
2. Identify which values are direct user inputs, which values come from APIs, and which values are derived.
3. Preserve units explicitly: kW, kWh, MWh, USD/kWh, Celsius, monthly totals, and annual totals.
4. Check edge cases for missing API data, zero or minimum inputs, high rack counts, high PUE, and unusual temperatures.
5. Keep formula changes centralized in `src/utils/costCalc.js` when possible.
6. Update UI labels or summaries when a formula meaning changes.
7. Run the project's available validation commands, typically lint and build.

## Current Model

For the current formula reference, read `references/current-formulas.md`.

## Testing Guidance

Prefer focused tests or manual calculations for formula changes. At minimum, verify:

- PUE never drops below `1.0`.
- Cooling energy equals total facility energy minus IT energy.
- Monthly cost equals IT cost plus cooling cost plus overhead.
- Annual cost equals monthly cost times 12.
- Formatters return an em dash for null, undefined, or invalid numeric values.
