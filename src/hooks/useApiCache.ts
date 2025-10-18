import { useState, useEffect, useCallback } from 'react'

interface CacheOptions {
  cacheExpiry?: number // in milliseconds
  cacheKey: string
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApiCache<T>(
  endpoint: string, 
  options: CacheOptions
): ApiState<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { cacheKey, cacheExpiry = 5 * 60 * 1000 } = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cached = sessionStorage.getItem(cacheKey)
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}-timestamp`)
      
      if (cached && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheExpiry) {
        try {
          const cachedData = JSON.parse(cached)
          setData(cachedData)
          setLoading(false)
          return
        } catch (e) {
          // Clear invalid cache
          sessionStorage.removeItem(cacheKey)
          sessionStorage.removeItem(`${cacheKey}-timestamp`)
        }
      }

      // Fetch fresh data
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(await res.text())
      const freshData = await res.json()

      // Cache the response
      sessionStorage.setItem(cacheKey, JSON.stringify(freshData))
      sessionStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())

      setData(freshData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [endpoint, cacheKey, cacheExpiry])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Specialized hook for multiple endpoints
export function useMultiApiCache<T extends Record<string, any>>(
  endpoints: Array<{ url: string; key: keyof T; cacheKey: string }>,
  cacheExpiry: number = 5 * 60 * 1000
): ApiState<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWithCache = useCallback(async (endpoint: string, cacheKey: string) => {
    // Check cache first
    const cached = sessionStorage.getItem(cacheKey)
    const cacheTimestamp = sessionStorage.getItem(`${cacheKey}-timestamp`)
    
    if (cached && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheExpiry) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        sessionStorage.removeItem(cacheKey)
        sessionStorage.removeItem(`${cacheKey}-timestamp`)
      }
    }
    
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    
    sessionStorage.setItem(cacheKey, JSON.stringify(data))
    sessionStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
    
    return data
  }, [cacheExpiry])

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const results = await Promise.all(
        endpoints.map(({ url, cacheKey }) => fetchWithCache(url, cacheKey))
      )

      const combinedData = {} as T
      endpoints.forEach(({ key }, index) => {
        combinedData[key] = results[index]
      })

      setData(combinedData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [endpoints, fetchWithCache])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { data, loading, error, refetch: fetchAll }
}
