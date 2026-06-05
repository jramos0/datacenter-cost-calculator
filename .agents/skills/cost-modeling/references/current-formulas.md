# Current Cost Formulas

This reference describes the formulas currently implemented in `src/utils/costCalc.js`.

## Effective PUE

Inputs:

- `basePUE`: baseline power usage effectiveness.
- `avgTempC`: average ambient temperature in Celsius.

Rules:

- If `avgTempC` is null or undefined, return `basePUE`.
- Temperature baseline is `20 C`.
- For temperatures above `20 C`, add `0.01` PUE per degree.
- For temperatures below `20 C`, subtract `0.005` PUE per degree.
- Clamp the final value to a minimum of `1.0`.

Formula:

```text
delta = avgTempC - 20
adjustment = delta > 0 ? delta * 0.01 : delta * 0.005
pueEff = max(1.0, basePUE + adjustment)
```

## Monthly Cost

Inputs:

- `racks`: number of racks.
- `kWPerRack`: IT power per rack.
- `pueBase`: baseline PUE.
- `uptimeHours`: daily uptime hours.
- `ratePerKwh`: electricity rate in USD per kWh.
- `avgTempC`: average ambient temperature in Celsius.

Constants:

- Monthly duration uses `30` days.
- Overhead is `8%` of energy subtotal.

Formulas:

```text
itPowerKW = racks * kWPerRack
itEnergyKWh = itPowerKW * uptimeHours * 30
pueEff = effectivePUE(pueBase, avgTempC)

totalEnergyKWh = itEnergyKWh * pueEff
coolingEnergyKWh = totalEnergyKWh - itEnergyKWh

itCost = itEnergyKWh * ratePerKwh
coolingCost = coolingEnergyKWh * ratePerKwh
energySubtotal = itCost + coolingCost
overheadCost = energySubtotal * 0.08

totalMonthly = energySubtotal + overheadCost
totalAnnual = totalMonthly * 12
```

## Unit Notes

- Power is shown in `kW`.
- Energy is calculated in `kWh`.
- Some UI summaries convert `kWh` to `MWh` by dividing by `1000`.
- Electricity rate is shown as USD per `kWh`.
