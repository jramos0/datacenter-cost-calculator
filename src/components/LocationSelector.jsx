import { EL_SALVADOR, US_STATES } from '../data/states'
import { fmtCents } from '../utils/costCalc'

export default function LocationSelector({ selectedId, onSelect, rates, ratesLoading, temps, tempsLoading }) {
  const allLocs = [EL_SALVADOR, ...US_STATES]

  return (
    <div className="rounded-lg p-4" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#14b8a6' }}>
          &gt; SELECT LOCATION
        </span>
        <span className="text-xs" style={{ color: '#4a6080' }}>
          — {allLocs.length} locations
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allLocs.map(loc => {
          const isSV = loc.isSV
          const isSelected = loc.id === selectedId
          const rate = isSV ? loc.hardcodedRate : (rates[loc.id] ?? null)
          const temp = isSV ? loc.hardcodedTemp : (temps[loc.id] ?? null)

          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc.id)}
              title={`${loc.name} | ${rate ? fmtCents(rate) : 'loading...'} | ${temp != null ? temp + '°C' : '...'}`}
              className="relative px-2 py-1.5 rounded text-xs font-mono transition-all duration-150"
              style={{
                background: isSelected
                  ? (isSV ? 'rgba(20,184,166,0.25)' : 'rgba(20,184,166,0.15)')
                  : (isSV ? 'rgba(20,184,166,0.08)' : '#162030'),
                border: isSelected
                  ? `1px solid ${isSV ? '#14b8a6' : '#2d8a7a'}`
                  : `1px solid ${isSV ? 'rgba(20,184,166,0.4)' : '#1e2d3d'}`,
                color: isSelected
                  ? (isSV ? '#2dd4bf' : '#7dd3c8')
                  : (isSV ? '#14b8a6' : '#94a3b8'),
                minWidth: isSV ? 'auto' : '52px',
                boxShadow: isSelected && isSV ? '0 0 12px rgba(20,184,166,0.3)' : 'none',
              }}
            >
              {isSV ? (
                <span className="flex items-center gap-1">
                  <span>🇸🇻</span>
                  <span>SV</span>
                </span>
              ) : (
                loc.id
              )}
              {isSelected && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full pulse-dot"
                  style={{ background: '#14b8a6', boxShadow: '0 0 6px #14b8a6' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected location detail */}
      {selectedId && (() => {
        const loc = allLocs.find(l => l.id === selectedId)
        if (!loc) return null
        const rate = loc.isSV ? loc.hardcodedRate : (rates[loc.id] ?? null)
        const temp = loc.isSV ? loc.hardcodedTemp : (temps[loc.id] ?? null)
        return (
          <div className="mt-3 pt-3 flex flex-wrap gap-4"
            style={{ borderTop: '1px solid #1e2d3d' }}>
            <div>
              <span className="text-xs" style={{ color: '#4a6080' }}>LOCATION </span>
              <span className="font-mono text-sm font-bold" style={{ color: loc.isSV ? '#2dd4bf' : '#e2e8f0' }}>
                {loc.name} {loc.isSV && '🇸🇻'}
              </span>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#4a6080' }}>RATE </span>
              <span className="font-mono text-sm font-bold" style={{ color: '#14b8a6' }}>
                {ratesLoading && !loc.isSV ? '···' : (rate ? fmtCents(rate) : '—')}
              </span>
              {loc.isSV && <span className="text-xs ml-1" style={{ color: '#4a6080' }}>(fixed)</span>}
            </div>
            <div>
              <span className="text-xs" style={{ color: '#4a6080' }}>AVG TEMP </span>
              <span className="font-mono text-sm font-bold" style={{ color: temp != null && temp > 25 ? '#f59e0b' : '#e2e8f0' }}>
                {tempsLoading && !loc.isSV ? '···' : (temp != null ? `${temp}°C` : '—')}
              </span>
              {loc.isSV && <span className="text-xs ml-1" style={{ color: '#4a6080' }}>(hardcoded)</span>}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
