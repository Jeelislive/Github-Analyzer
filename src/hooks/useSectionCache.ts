import { useState, useCallback } from 'react'

interface SectionState<T> {
  items: T[]
  page?: number
  total?: number
  loaded?: boolean
  loading: boolean
}

interface UseSectionCacheOptions {
  cacheExpiry?: number
}

export function useSectionCache<T, S extends string>(
  sections: Record<S, SectionState<T>>,
  setSections: React.Dispatch<React.SetStateAction<Record<S, SectionState<T>>>>,
  baseEndpoint: string,
  options: UseSectionCacheOptions = {}
) {
  const { cacheExpiry = 5 * 60 * 1000 } = options

  const loadSection = useCallback(async (section: S) => {
    // Check if already loaded or loading
    if (sections[section].loaded || sections[section].loading) return

    setSections((s) => ({ ...s, [section]: { ...s[section], loading: true } }))
    
    // Check cache first
    const cacheKey = `${baseEndpoint.replace('/api/github/', '')}-section-${section}`
    const cached = sessionStorage.getItem(cacheKey)
    const cacheTimestamp = sessionStorage.getItem(`${cacheKey}-timestamp`)
    
    if (cached && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheExpiry) {
      try {
        const cachedData = JSON.parse(cached)
        setSections((s) => ({
          ...s,
          [section]: {
            ...s[section],
            items: cachedData.items,
            page: cachedData.page || 1,
            total: cachedData.total,
            loaded: true,
            loading: false,
          },
        }))
        return
      } catch (e) {
        // Clear invalid cache
        sessionStorage.removeItem(cacheKey)
        sessionStorage.removeItem(`${cacheKey}-timestamp`)
      }
    }
    
    try {
      const res = await fetch(`${baseEndpoint}?section=${section}`)
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      
      // Cache the response
      sessionStorage.setItem(cacheKey, JSON.stringify(json))
      sessionStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString())
      
      setSections((s) => ({
        ...s,
        [section]: {
          ...s[section],
          items: json.items,
          page: json.page || 1,
          total: json.total,
          loaded: true,
          loading: false,
        },
      }))
    } catch (e) {
      setSections((s) => ({ ...s, [section]: { ...s[section], loading: false } }))
      // Silently fail - UI already has page content
    }
  }, [sections, setSections, baseEndpoint, cacheExpiry])

  return { loadSection }
}
