import { fmt$$, fmtKwh } from '../utils/costCalc'

function Row({ label, kwh, cost, total, isTotal, isSub, accent }) {
  const pct = total > 0 ? (cost / total) * 100 : 0
  return (
    <tr style={{
      borderTop: isTotal ? '1px solid #2d4a6b' : '1px solid #1e2d3d',
      background: isTotal ? 'rgba(20,184,166,0.05)' : 'transparent',
    }}>
      <td className="py-2 px-3" style={{ color: isSub ? '#64748b' : '#94a3b8', paddingLeft: isSub ? '24px' : '12px' }}>
        <span className="text-xs">{label}</span>
      </td>
      <td className="py-2 px-3 font-mono text-xs text-right" style={{ color: '#4a6080' }}>
        {kwh != null ? fmtKwh(kwh) : '—'}
      </td>
      <td className="py-2 px-3 font-mono text-sm text-right font-bold"
        style={{ color: isTotal ? (accent ? '#2dd4bf' : '#14b8a6') : '#e2e8f0' }}>
        {fmt$$(cost)}
      </td>
      <td className="py-2 px-3 w-28">
        {!isTotal && pct > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 rounded overflow-hidden" style={{ background: '#162030', height: '4px' }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: '#14b8a6', borderRadius: '2px' }} />
            </div>
            <span className="text-xs font-mono" style={{ color: '#4a6080', minWidth: '32px' }}>
              {pct.toFixed(0)}%
            </span>
          </div>
        )}
      </td>
    </tr>
  )
}

export default function CostBreakdown({ result, isSV }) {
  if (!result) return null

  const { itEnergyKWh, coolingEnergyKWh, totalEnergyKWh, itCost, coolingCost, overheadCost, totalMonthly } = result

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e2d3d', background: '#162030' }}>
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#14b8a6' }}>
          &gt; MONTHLY COST BREAKDOWN
        </span>
        <span className="text-xs ml-2" style={{ color: '#4a6080' }}>
          — {result.avgTempC != null ? `${result.avgTempC}°C avg | ` : ''}
          PUE {result.pueEff?.toFixed(3)} effective
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid #1e2d3d' }}>
            <th className="py-2 px-3 text-left text-xs uppercase" style={{ color: '#2d4a6b' }}>Component</th>
            <th className="py-2 px-3 text-right text-xs uppercase" style={{ color: '#2d4a6b' }}>Energy</th>
            <th className="py-2 px-3 text-right text-xs uppercase" style={{ color: '#2d4a6b' }}>Cost</th>
            <th className="py-2 px-3 text-xs uppercase" style={{ color: '#2d4a6b' }}>Share</th>
          </tr>
        </thead>
        <tbody>
          <Row label="IT Energy" kwh={itEnergyKWh} cost={itCost} total={totalMonthly} />
          <Row label="Cooling Overhead" kwh={coolingEnergyKWh} cost={coolingCost} total={totalMonthly} isSub />
          <Row label="Other Overhead (8%)" kwh={null} cost={overheadCost} total={totalMonthly} isSub />
          <Row label="TOTAL MONTHLY" kwh={totalEnergyKWh} cost={totalMonthly} total={totalMonthly} isTotal accent={isSV} />
        </tbody>
      </table>

      {/* Energy flow diagram */}
      <div className="px-4 pb-4 pt-2">
        <div className="text-xs mb-2" style={{ color: '#2d4a6b' }}>ENERGY DISTRIBUTION</div>
        <div className="flex rounded overflow-hidden h-5">
          <div
            style={{ width: `${(itEnergyKWh / totalEnergyKWh) * 100}%`, background: 'linear-gradient(90deg, #14b8a6, #0d9488)' }}
            title={`IT: ${fmtKwh(itEnergyKWh)}`}
            className="flex items-center justify-center"
          >
            <span className="text-xs font-mono font-bold text-white">
              IT {((itEnergyKWh / totalEnergyKWh) * 100).toFixed(0)}%
            </span>
          </div>
          <div
            style={{ width: `${(coolingEnergyKWh / totalEnergyKWh) * 100}%`, background: 'linear-gradient(90deg, #1e3a8a, #1e2d6b)' }}
            title={`Cooling: ${fmtKwh(coolingEnergyKWh)}`}
            className="flex items-center justify-center"
          >
            <span className="text-xs font-mono font-bold" style={{ color: '#93c5fd' }}>
              COOL {((coolingEnergyKWh / totalEnergyKWh) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
