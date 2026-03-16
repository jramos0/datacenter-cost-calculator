import { fmt$$, fmtCents } from '../utils/costCalc'

function MetricCard({ label, value, sub, accent, glow }) {
  return (
    <div className="rounded-lg p-4 flex flex-col justify-between"
      style={{
        background: '#0f1923',
        border: `1px solid ${accent ? 'rgba(20,184,166,0.4)' : '#1e2d3d'}`,
        boxShadow: glow ? '0 0 20px rgba(20,184,166,0.15)' : 'none',
      }}>
      <span className="text-xs uppercase tracking-widest" style={{ color: '#4a6080' }}>{label}</span>
      <span className="font-mono text-2xl font-bold mt-1"
        style={{ color: accent ? '#14b8a6' : '#e2e8f0' }}>
        {value}
      </span>
      {sub && <span className="text-xs mt-1" style={{ color: '#4a6080' }}>{sub}</span>}
    </div>
  )
}

export default function SummaryCards({ result, locationName, isSV }) {
  if (!result) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg p-4 h-24 animate-pulse" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }} />
        ))}
      </div>
    )
  }

  const { totalMonthly, totalAnnual, ratePerKwh, pueEff, avgTempC, itPowerKW } = result
  const tempPenalty = avgTempC != null ? Math.max(0, (avgTempC - 20) * 0.01) : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-mono uppercase tracking-widest px-1" style={{ color: '#4a6080' }}>
        &gt; {locationName} — COST SUMMARY
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Monthly Cost"
          value={fmt$$(totalMonthly)}
          sub={`${fmt$$(totalMonthly / 30)}/day`}
          accent={isSV}
          glow={isSV}
        />
        <MetricCard
          label="Annual Cost"
          value={fmt$$(totalAnnual)}
          sub={`${fmt$$(totalAnnual / 8760)}/hr`}
        />
        <MetricCard
          label="Rate $/kWh"
          value={fmtCents(ratePerKwh)}
          sub={isSV ? 'fixed rate' : 'commercial'}
        />
        <MetricCard
          label="Effective PUE"
          value={pueEff?.toFixed(3) ?? '—'}
          sub={
            tempPenalty > 0
              ? `+${(tempPenalty).toFixed(3)} temp penalty`
              : avgTempC != null && avgTempC < 20
              ? `${(pueEff - result.pueBase)?.toFixed(3)} cool bonus`
              : 'no temp adjustment'
          }
        />
      </div>

      {/* PUE breakdown bar */}
      {pueEff != null && (
        <div className="rounded p-3" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: '#4a6080' }}>PUE BREAKDOWN</span>
            <span className="font-mono" style={{ color: '#e2e8f0' }}>{pueEff?.toFixed(3)}</span>
          </div>
          <div className="flex rounded overflow-hidden h-3">
            {/* IT load = 1.0 */}
            <div
              style={{
                width: `${(1 / pueEff) * 100}%`,
                background: 'linear-gradient(90deg, #14b8a6, #0d9488)',
              }}
              title={`IT Load: ${((1 / pueEff) * 100).toFixed(1)}%`}
            />
            {/* Cooling overhead */}
            <div
              style={{
                width: `${((pueEff - 1) / pueEff) * 100}%`,
                background: tempPenalty > 0
                  ? 'linear-gradient(90deg, #dc2626, #b91c1c)'
                  : 'linear-gradient(90deg, #1e3a5f, #162030)',
              }}
              title={`Cooling: ${(((pueEff - 1) / pueEff) * 100).toFixed(1)}%`}
            />
          </div>
          <div className="flex gap-3 mt-1.5">
            <span className="text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#14b8a6' }} />
              <span style={{ color: '#4a6080' }}>IT: {((1 / pueEff) * 100).toFixed(0)}%</span>
            </span>
            <span className="text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: tempPenalty > 0 ? '#dc2626' : '#1e3a5f' }} />
              <span style={{ color: '#4a6080' }}>Cooling: {(((pueEff - 1) / pueEff) * 100).toFixed(0)}%</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
