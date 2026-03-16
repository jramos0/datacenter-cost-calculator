export default function Header({ source }) {
  return (
    <header style={{ background: '#0a1220', borderBottom: '1px solid #1e2d3d' }} className="px-6 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Server rack icon */}
          <div className="w-8 h-8 flex flex-col justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-1.5 rounded-sm flex items-center gap-1"
                style={{ background: '#162030', border: '1px solid #1e2d3d' }}>
                <div className="w-1.5 h-1.5 rounded-full ml-1 pulse-dot"
                  style={{ background: i === 0 ? '#14b8a6' : '#2d4a6b', animationDelay: `${i * 0.4}s` }} />
              </div>
            ))}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider" style={{ color: '#e2e8f0', letterSpacing: '0.08em' }}>
              DATACENTER COST CALCULATOR
            </h1>
            <p className="text-xs" style={{ color: '#4a6080' }}>
              Power Usage & Electricity Cost Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {source === 'eia' && (
            <span className="text-xs px-2 py-1 rounded font-mono"
              style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.3)' }}>
              LIVE EIA RATES
            </span>
          )}
          {source === 'fallback' && (
            <span className="text-xs px-2 py-1 rounded font-mono"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              ESTIMATED RATES
            </span>
          )}
          {source === 'loading' && (
            <span className="text-xs px-2 py-1 rounded font-mono animate-pulse"
              style={{ background: 'rgba(30,45,61,0.8)', color: '#4a6080', border: '1px solid #1e2d3d' }}>
              LOADING...
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
