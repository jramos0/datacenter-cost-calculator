/**
 * Calculate effective PUE with temperature penalty.
 * Baseline: 20°C. Each degree above adds 0.01 to PUE.
 * Each degree below 20°C reduces PUE by 0.005 (free cooling benefit).
 */
export function effectivePUE(basePUE, avgTempC) {
  if (avgTempC === null || avgTempC === undefined) return basePUE
  const delta = avgTempC - 20
  const penalty = delta > 0 ? delta * 0.01 : delta * 0.005
  return Math.max(1.0, basePUE + penalty)
}

/**
 * Calculate monthly datacenter costs.
 *
 * @param {Object} config - { racks, kWPerRack, pueBase, uptimeHours }
 * @param {number} ratePerKwh - electricity rate in $/kWh
 * @param {number} avgTempC   - average ambient temperature in °C
 * @returns {Object} cost breakdown
 */
export function calcMonthlyCost(config, ratePerKwh, avgTempC) {
  const { racks, kWPerRack, pueBase, uptimeHours } = config
  const DAYS = 30

  // IT power and energy
  const itPowerKW = racks * kWPerRack
  const itEnergyKWh = itPowerKW * uptimeHours * DAYS

  // Effective PUE with temperature adjustment
  const pueEff = effectivePUE(pueBase, avgTempC)

  // Total facility energy (IT + cooling overhead)
  const totalEnergyKWh = itEnergyKWh * pueEff
  const coolingEnergyKWh = totalEnergyKWh - itEnergyKWh

  // Cost components
  const itCost = itEnergyKWh * ratePerKwh
  const coolingCost = coolingEnergyKWh * ratePerKwh
  const energySubtotal = itCost + coolingCost

  // Other overhead: 8% of energy costs (facilities, management, etc.)
  const overheadCost = energySubtotal * 0.08

  const totalMonthly = energySubtotal + overheadCost

  return {
    itPowerKW,
    itEnergyKWh,
    coolingEnergyKWh,
    totalEnergyKWh,
    pueEff,
    itCost,
    coolingCost,
    overheadCost,
    totalMonthly,
    totalAnnual: totalMonthly * 12,
    ratePerKwh,
    avgTempC,
  }
}

export function fmt$$(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function fmtKwh(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' kWh'
}

export function fmtCents(rate) {
  if (rate === null || rate === undefined || isNaN(rate)) return '—'
  return '$' + rate.toFixed(4) + '/kWh'
}
