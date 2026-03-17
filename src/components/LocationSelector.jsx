import { useState, useMemo } from 'react'
import { EL_SALVADOR, US_STATES } from '../data/states'

const ALL_LOCS = [EL_SALVADOR, ...US_STATES]

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export default function LocationSelector({ selectedId, onSelect, rates, ratesLoading, temps, tempsLoading }) {
  const [query, setQuery] = useState('')

  const sorted = useMemo(() => {
    return [...ALL_LOCS].sort((a, b) => {
      const rateA = a.isSV ? a.hardcodedRate : (rates[a.id] ?? Infinity)
      const rateB = b.isSV ? b.hardcodedRate : (rates[b.id] ?? Infinity)
      return rateA - rateB
    })
  }, [rates])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter(loc =>
      loc.name.toLowerCase().includes(q) || loc.id.toLowerCase().includes(q)
    )
  }, [sorted, query])

  return (
    <div className="rounded-lg p-4" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#14b8a6' }}>
          &gt; SELECT LOCATION
        </span>
        <span className="text-xs font-mono" style={{ color: '#4a6080' }}>
          {filtered.length}/{ALL_LOCS.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }}>
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full text-xs font-mono rounded pl-7 pr-3 py-2 outline-none"
          style={{
            background: '#162030',
            border: '1px solid #1e2d3d',
            color: '#e2e8f0',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: '#4a6080' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Column headers */}
      <div className="grid text-xs uppercase tracking-wider mb-1 px-2"
        style={{ gridTemplateColumns: '48px 1fr 72px 88px', color: '#2d4a6b' }}>
        <span>Code</span>
        <span>Location</span>
        <span className="text-center">Temp</span>
        <span className="text-right">Rate ¢/kWh</span>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto rounded" style={{ maxHeight: '384px', border: '1px solid #1e2d3d' }}>
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono" style={{ color: '#4a6080' }}>
            No locations match "{query}"
          </div>
        ) : (
          filtered.map(loc => {
            const isSV = loc.isSV
            const isSelected = loc.id === selectedId
            const rate = isSV ? loc.hardcodedRate : (rates[loc.id] ?? null)
            const temp = isSV ? loc.hardcodedTemp : (temps[loc.id] ?? null)
            const rateCents = rate != null ? (rate * 100).toFixed(1) + '¢' : (ratesLoading ? '···' : '—')
            const tempStr = temp != null ? `${temp}°C` : (tempsLoading && !isSV ? '···' : '—')

            return (
              <button
                key={loc.id}
                onClick={() => onSelect(loc.id)}
                className="w-full grid text-xs transition-colors duration-100"
                style={{
                  gridTemplateColumns: '48px 1fr 72px 88px',
                  padding: '7px 8px',
                  borderLeft: isSelected ? '3px solid #14b8a6' : '3px solid transparent',
                  borderBottom: '1px solid #1e2d3d',
                  background: isSelected ? 'rgba(20,184,166,0.08)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Code */}
                <span className="font-mono" style={{ color: isSV ? '#14b8a6' : '#4a6080' }}>
                  {isSV ? '🇸🇻' : loc.id}
                </span>

                {/* Name */}
                <span className="font-semibold truncate" style={{ color: isSelected ? '#e2e8f0' : '#94a3b8' }}>
                  {loc.name}
                </span>

                {/* Temp */}
                <span className="font-mono text-center"
                  style={{ color: temp != null && temp > 25 ? '#f59e0b' : '#64748b' }}>
                  {tempStr}
                </span>

                {/* Rate */}
                <span className="font-mono text-right"
                  style={{ color: isSV ? '#14b8a6' : '#e2e8f0' }}>
                  {rateCents}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
