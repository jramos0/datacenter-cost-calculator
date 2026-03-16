import { useState, useEffect } from 'react'
import axios from 'axios'
import { FALLBACK_RATES } from '../data/states'

const EIA_KEY = import.meta.env.VITE_EIA_API_KEY

/**
 * Fetches commercial electricity rates ($/kWh) for all US states from EIA API v2.
 * Falls back to hardcoded rates if the API key is missing or call fails.
 */
export function useEIA() {
  const [rates, setRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('loading') // 'eia' | 'fallback'

  useEffect(() => {
    if (!EIA_KEY || EIA_KEY === 'YOUR_KEY') {
      setRates(FALLBACK_RATES)
      setSource('fallback')
      setLoading(false)
      return
    }

    const fetchRates = async () => {
      try {
        const params = new URLSearchParams({
          api_key: EIA_KEY,
          frequency: 'monthly',
          'data[0]': 'price',
          'facets[sectorName][]': 'commercial',
          'sort[0][column]': 'period',
          'sort[0][direction]': 'desc',
          length: '100',
          offset: '0',
        })

        const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?${params}`
        const { data } = await axios.get(url, { timeout: 10000 })

        const rows = data?.response?.data ?? []
        const parsed = {}

        // Take the most-recent entry per state (already sorted desc by period)
        for (const row of rows) {
          const sid = row.stateid
          if (sid && !parsed[sid] && row.price != null) {
            // EIA price is in cents/kWh → convert to $/kWh
            parsed[sid] = parseFloat(row.price) / 100
          }
        }

        // Merge with fallback for any missing states
        const merged = { ...FALLBACK_RATES, ...parsed }
        setRates(merged)
        setSource('eia')
      } catch (err) {
        console.warn('EIA API failed, using fallback rates:', err.message)
        setRates(FALLBACK_RATES)
        setSource('fallback')
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  return { rates, loading, error, source }
}
