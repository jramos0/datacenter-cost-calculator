function SliderRow({ label, unit, value, min, max, step, onChange, format }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs uppercase tracking-widest" style={{ color: '#4a6080' }}>{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color: '#e2e8f0' }}>
          {format ? format(value) : value}{unit && <span style={{ color: '#4a6080' }} className="text-xs ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-xs font-mono" style={{ color: '#2d4a6b' }}>
        <span>{format ? format(min) : min}{unit}</span>
        <span>{format ? format(max) : max}{unit}</span>
      </div>
    </div>
  )
}

export default function RackConfig({ config, onChange }) {
  const set = (key) => (val) => onChange({ ...config, [key]: val })

  return (
    <div className="rounded-lg p-4 flex flex-col gap-5" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#14b8a6' }}>
          &gt; RACK CONFIGURATION
        </span>
      </div>

      <SliderRow
        label="Total Racks"
        unit=" racks"
        value={config.racks}
        min={1} max={500} step={1}
        onChange={set('racks')}
      />

      <SliderRow
        label="Power per Rack"
        unit=" kW"
        value={config.kWPerRack}
        min={1} max={50} step={0.5}
        onChange={set('kWPerRack')}
      />

      <SliderRow
        label="Base PUE"
        value={config.pueBase}
        min={1.0} max={3.0} step={0.05}
        onChange={set('pueBase')}
        format={v => v.toFixed(2)}
      />

      <SliderRow
        label="Uptime Hours / Day"
        unit=" hrs"
        value={config.uptimeHours}
        min={1} max={24} step={0.5}
        onChange={set('uptimeHours')}
        format={v => v.toFixed(1)}
      />

      {/* Computed power summary */}
      <div className="rounded p-3 flex gap-4" style={{ background: '#162030', border: '1px solid #1e2d3d' }}>
        <div>
          <div className="text-xs" style={{ color: '#4a6080' }}>IT LOAD</div>
          <div className="font-mono text-base font-bold" style={{ color: '#e2e8f0' }}>
            {(config.racks * config.kWPerRack).toFixed(1)}
            <span className="text-xs ml-0.5" style={{ color: '#4a6080' }}>kW</span>
          </div>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#4a6080' }}>MONTHLY HOURS</div>
          <div className="font-mono text-base font-bold" style={{ color: '#e2e8f0' }}>
            {(config.uptimeHours * 30).toFixed(0)}
            <span className="text-xs ml-0.5" style={{ color: '#4a6080' }}>hrs</span>
          </div>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#4a6080' }}>IT ENERGY</div>
          <div className="font-mono text-base font-bold" style={{ color: '#e2e8f0' }}>
            {((config.racks * config.kWPerRack) * config.uptimeHours * 30 / 1000).toFixed(1)}
            <span className="text-xs ml-0.5" style={{ color: '#4a6080' }}>MWh</span>
          </div>
        </div>
      </div>
    </div>
  )
}
