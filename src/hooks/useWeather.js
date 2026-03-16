import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * Fetches the 7-day average max temperature for a single location.
 */
export function useTemperature(lat, lon, skip = false) {
  const [temp, setTemp] = useState(null)
  const [loading, setLoading] = useState(!skip)

  useEffect(() => {
    if (skip || lat == null || lon == null) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    axios
      .get(BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          daily: 'temperature_2m_max',
          timezone: 'auto',
          forecast_days: 7,
        },
        timeout: 8000,
      })
      .then(({ data }) => {
        if (cancelled) return
        const temps = data?.daily?.temperature_2m_max ?? []
        if (temps.length > 0) {
          const avg = temps.reduce((a, b) => a + b, 0) / temps.length
          setTemp(Math.round(avg * 10) / 10)
        }
      })
      .catch(() => {
        if (!cancelled) setTemp(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [lat, lon, skip])

  return { temp, loading }
}

/**
 * Fetches temperatures for multiple locations in parallel, with concurrency limit.
 */
export function useAllTemperatures(locations) {
  const [temps, setTemps] = useState({})
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!locations?.length || hasFetched.current) return
    hasFetched.current = true

    const CONCURRENCY = 10

    const fetchOne = async ({ id, lat, lon, hardcodedTemp }) => {
      if (hardcodedTemp != null) return { id, temp: hardcodedTemp }
      try {
        const { data } = await axios.get(BASE_URL, {
          params: {
            latitude: lat,
            longitude: lon,
            daily: 'temperature_2m_max',
            timezone: 'auto',
            forecast_days: 7,
          },
          timeout: 8000,
        })
        const arr = data?.daily?.temperature_2m_max ?? []
        if (arr.length === 0) return { id, temp: null }
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length
        return { id, temp: Math.round(avg * 10) / 10 }
      } catch {
        return { id, temp: null }
      }
    }

    const runBatched = async () => {
      const results = {}
      const queue = [...locations]

      const worker = async () => {
        while (queue.length > 0) {
          const loc = queue.shift()
          if (!loc) break
          const { id, temp } = await fetchOne(loc)
          results[id] = temp
          setTemps(prev => ({ ...prev, [id]: temp }))
        }
      }

      const workers = Array.from({ length: CONCURRENCY }, () => worker())
      await Promise.all(workers)
      setLoading(false)
    }

    runBatched()
  }, [locations])

  return { temps, loading }
}
