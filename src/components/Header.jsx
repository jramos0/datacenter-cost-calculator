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
            <h1 className="text-base font-bold tracking-wider" style={{ color: '#e2e8f0', letterSpacing: '0.06em' }}>
              DATACENTER COST CALCULATOR
            </h1>
            <p style={{ fontSize: '11px', color: '#2d4a6b', marginTop: '1px' }}>
              Power Usage & Electricity Cost Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {source === 'eia' && (
            <span style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: '#14b8a6' }}>
              ● live rates
            </span>
          )}
          {source === 'fallback' && (
            <span style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: '#f59e0b' }}>
              ● estimated rates
            </span>
          )}
          {source === 'loading' && (
            <span className="animate-pulse" style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: '#2d4a6b' }}>
              ● loading...
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
