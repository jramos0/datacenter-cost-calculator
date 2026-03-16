import { useState, useMemo } from 'react'
import { ALL_LOCATIONS } from './data/states'
import { calcMonthlyCost } from './utils/costCalc'
import { useEIA } from './hooks/useEIA'
import { useAllTemperatures } from './hooks/useWeather'
import Header from './components/Header'
import LocationSelector from './components/LocationSelector'
import RackConfig from './components/RackConfig'
import SummaryCards from './components/SummaryCards'
import CostBreakdown from './components/CostBreakdown'
import ComparisonChart from './components/ComparisonChart'

const DEFAULT_CONFIG = {
  racks: 20,
  kWPerRack: 10,
  pueBase: 1.4,
  uptimeHours: 24,
}

export default function App() {
  const [selectedId, setSelectedId] = useState('TX')
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const { rates, loading: ratesLoading, source: rateSource } = useEIA()
  const { temps, loading: tempsLoading } = useAllTemperatures(ALL_LOCATIONS)

  const selectedLoc = useMemo(
    () => ALL_LOCATIONS.find(l => l.id === selectedId),
    [selectedId]
  )

  const currentRate = selectedLoc?.isSV
    ? selectedLoc.hardcodedRate
    : (rates[selectedId] ?? null)

  const currentTemp = selectedLoc?.isSV
    ? selectedLoc.hardcodedTemp
    : (temps[selectedId] ?? null)

  const result = useMemo(() => {
    if (currentRate == null) return null
    return calcMonthlyCost(config, currentRate, currentTemp)
  }, [config, currentRate, currentTemp])

  return (
    <div style={{ minHeight: '100vh', background: '#080d14' }}>
      <Header source={ratesLoading ? 'loading' : rateSource} />

      <main className="max-w-screen-xl mx-auto p-4 flex flex-col gap-4">
        <LocationSelector
          selectedId={selectedId}
          onSelect={setSelectedId}
          rates={rates}
          ratesLoading={ratesLoading}
          temps={temps}
          tempsLoading={tempsLoading}
        />

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <RackConfig config={config} onChange={setConfig} />
          <SummaryCards
            result={result}
            locationName={selectedLoc?.name ?? selectedId}
            isSV={!!selectedLoc?.isSV}
          />
        </div>

        <CostBreakdown result={result} isSV={!!selectedLoc?.isSV} />

        <ComparisonChart
          config={config}
          rates={rates}
          temps={temps}
          selectedId={selectedId}
        />

        <footer className="text-xs text-center py-4 flex flex-wrap justify-center gap-4"
          style={{ color: '#2d4a6b', borderTop: '1px solid #1e2d3d' }}>
          <span>US rates: EIA API (commercial sector)</span>
          <span>·</span>
          <span>Temperatures: Open-Meteo 7-day avg max</span>
          <span>·</span>
          <span>El Salvador: fixed $0.18/kWh · 28°C</span>
          <span>·</span>
          <span>Temp penalty: +0.01 PUE per °C above 20°C</span>
        </footer>
      </main>
    </div>
  )
}
