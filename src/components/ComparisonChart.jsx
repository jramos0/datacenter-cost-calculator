import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ALL_LOCATIONS } from '../data/states'
import { calcMonthlyCost } from '../utils/costCalc'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ComparisonChart({ config, rates, temps, selectedId }) {
  const [expanded, setExpanded] = useState(false)

  const data = useMemo(() => {
    const entries = ALL_LOCATIONS
      .map(loc => {
        const rate = loc.isSV ? loc.hardcodedRate : rates[loc.id]
        const temp = loc.isSV ? loc.hardcodedTemp : temps[loc.id]
        if (rate == null) return null
        const result = calcMonthlyCost(config, rate, temp ?? null)
        return { id: loc.id, name: loc.name, isSV: !!loc.isSV, ...result }
      })
      .filter(Boolean)
      .sort((a, b) => a.totalMonthly - b.totalMonthly)

    return entries
  }, [config, rates, temps])

  if (data.length === 0) {
    return (
      <div className="rounded-lg p-6 flex items-center justify-center h-40"
        style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
        <span className="text-sm animate-pulse font-mono" style={{ color: '#4a6080' }}>
          LOADING COMPARISON DATA...
        </span>
      </div>
    )
  }

  const labels = data.map(d => d.id)
  const itCosts = data.map(d => d.itCost)
  const coolingCosts = data.map(d => d.coolingCost)
  const overheadCosts = data.map(d => d.overheadCost)
  const svIndex = data.findIndex(d => d.isSV)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'IT Energy',
        data: itCosts,
        backgroundColor: data.map(d =>
          d.id === selectedId ? 'rgba(45,212,191,0.95)' : d.isSV ? 'rgba(45,212,191,0.7)' : 'rgba(20,184,166,0.45)'
        ),
        borderColor: data.map(d =>
          d.id === selectedId ? '#2dd4bf' : d.isSV ? '#2dd4bf' : '#0d9488'
        ),
        borderWidth: data.map(d => d.id === selectedId ? 2 : 1),
        stack: 'stack',
      },
      {
        label: 'Cooling',
        data: coolingCosts,
        backgroundColor: data.map(d =>
          d.id === selectedId ? 'rgba(59,130,246,0.85)' : d.isSV ? 'rgba(30,58,138,0.7)' : 'rgba(30,45,100,0.45)'
        ),
        borderColor: data.map(d =>
          d.id === selectedId ? '#3b82f6' : d.isSV ? '#3b82f6' : '#1e2d6b'
        ),
        borderWidth: data.map(d => d.id === selectedId ? 2 : 1),
        stack: 'stack',
      },
      {
        label: 'Overhead',
        data: overheadCosts,
        backgroundColor: data.map(d =>
          d.id === selectedId ? 'rgba(245,158,11,0.5)' : d.isSV ? 'rgba(245,158,11,0.25)' : 'rgba(30,45,61,0.4)'
        ),
        borderColor: data.map(d =>
          d.id === selectedId ? 'rgba(245,158,11,0.8)' : d.isSV ? 'rgba(245,158,11,0.4)' : '#1e2d3d'
        ),
        borderWidth: 1,
        stack: 'stack',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#64748b',
          font: { family: 'Courier New', size: 11 },
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0f1923',
        borderColor: '#2d4a6b',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        titleFont: { family: 'Courier New', size: 12 },
        bodyFont: { family: 'Courier New', size: 11 },
        callbacks: {
          title: (items) => {
            const d = data[items[0].dataIndex]
            return `${d.name} (${d.id})`
          },
          label: (item) => {
            const val = item.raw
            return `  ${item.dataset.label}: $${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
          },
          afterBody: (items) => {
            const d = data[items[0].dataIndex]
            return [
              `  ──────────────────`,
              `  Total: $${d.totalMonthly.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
              `  Rate: $${d.ratePerKwh.toFixed(4)}/kWh`,
              `  PUE: ${d.pueEff?.toFixed(3)}`,
              d.avgTempC != null ? `  Temp: ${d.avgTempC}°C` : '',
            ].filter(Boolean)
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: (ctx) => {
            const d = data[ctx.index]
            if (!d) return '#4a6080'
            if (d.id === selectedId) return '#2dd4bf'
            if (d.isSV) return '#2dd4bf'
            return '#2d4a6b'
          },
          font: (ctx) => {
            const d = data[ctx.index]
            return {
              family: "'Space Mono', 'Courier New', monospace",
              size: 10,
              weight: d?.id === selectedId ? 'bold' : 'normal',
            }
          },
          callback: (val, index) => {
            const d = data[index]
            if (!d) return ''
            if (d.id === selectedId || d.isSV) return d.id
            return index % 5 === 0 ? d.id : ''
          },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: { color: '#1e2d3d', lineWidth: 0.5 },
        border: { color: '#1e2d3d' },
      },
      y: {
        stacked: true,
        ticks: {
          color: '#4a6080',
          font: { family: 'Courier New', size: 10 },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
        grid: { color: '#1e2d3d', lineWidth: 0.5 },
        border: { color: '#1e2d3d' },
      },
    },
  }

  // Stats
  const sorted = [...data].sort((a, b) => a.totalMonthly - b.totalMonthly)
  const cheapest = sorted[0]
  const mostExpensive = sorted[sorted.length - 1]

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: '#0f1923', border: '1px solid #1e2d3d' }}>
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between transition-colors duration-150"
        style={{
          background: expanded ? '#162030' : 'transparent',
          borderBottom: expanded ? '1px solid #1e2d3d' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#4a6080' }}>
            Cost Comparison — All Locations
          </span>
          <div className="flex gap-3 text-xs font-mono">
            <span style={{ color: '#2d4a6b' }}>
              Low: <span style={{ color: '#14b8a6' }}>{cheapest?.id}</span> ${cheapest?.totalMonthly?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
            <span style={{ color: '#2d4a6b' }}>
              High: <span style={{ color: '#ef4444' }}>{mostExpensive?.id}</span> ${mostExpensive?.totalMonthly?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
          </div>
        </div>
        <span className="text-xs font-mono" style={{ color: '#4a6080' }}>
          {expanded ? '▲ collapse' : '▼ expand'}
        </span>
      </button>

      {/* Expandable content */}
      {expanded && (
        <>
          <div className="p-4" style={{ height: '340px' }}>
            <Bar data={chartData} options={options} />
          </div>

          <div className="px-4 pb-4 flex flex-wrap gap-4">
            {[
              { label: 'Cheapest', loc: cheapest, color: '#14b8a6' },
              { label: 'Most Expensive', loc: mostExpensive, color: '#ef4444' },
            ].map(({ label, loc, color }) => loc && (
              <div key={label} className="text-xs font-mono" style={{ color: '#4a6080' }}>
                {label}:{' '}
                <span style={{ color }}>
                  {loc.isSV ? '🇸🇻 ' : ''}{loc.name}
                </span>
                {' — '}
                <span style={{ color: '#94a3b8' }}>
                  ${loc.totalMonthly?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  /mo @ ${loc.ratePerKwh.toFixed(4)}/kWh
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
