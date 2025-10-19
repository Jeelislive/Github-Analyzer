import { useState, useEffect, useCallback, useRef } from 'react'

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

// Specialized hook for multiple endpoints with better error handling
export function useMultiApiCache<T extends Record<string, any>>(
  endpoints: Array<{ url: string; key: keyof T; cacheKey: string; optional?: boolean }>,
  cacheExpiry: number = 5 * 60 * 1000
): ApiState<T> & { refetch: () => void; partialData: Partial<T> } {
  const [data, setData] = useState<T | null>(null)
  const [partialData, setPartialData] = useState<Partial<T>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const endpointsRef = useRef(endpoints)

  const fetchWithCache = useCallback(async (endpoint: string, cacheKey: string, optional: boolean = false) => {
    try {
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
      if (!res.ok) {
        if (optional) return null // Return null for optional endpoints that fail
        throw new Error(await res.text())
      }
      const data = await res.json()
      
      sessionStorage.setItem(cacheKey, JSON.stringify(data))
      sessionStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
      
      return data
    } catch (e) {
      if (optional) return null
      throw e
    }
  }, [cacheExpiry])

  // Update ref when endpoints change
  useEffect(() => {
    endpointsRef.current = endpoints
  }, [endpoints])

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const currentEndpoints = endpointsRef.current

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled(
        currentEndpoints.map(({ url, cacheKey, optional }) => fetchWithCache(url, cacheKey, optional))
      )

      const combinedData = {} as T
      const partial = {} as Partial<T>
      let hasAnyData = false
      let criticalError = null

      currentEndpoints.forEach(({ key, optional }, index) => {
        const result = results[index]
        if (result.status === 'fulfilled' && result.value !== null) {
          combinedData[key] = result.value
          partial[key] = result.value
          hasAnyData = true
        } else if (result.status === 'rejected' && !optional) {
          criticalError = result.reason
        }
      })

      setPartialData(partial)
      
      if (criticalError && !hasAnyData) {
        throw criticalError
      }
      
      if (hasAnyData) {
        setData(combinedData)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [fetchWithCache])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { data, partialData, loading, error, refetch: fetchAll }
}
