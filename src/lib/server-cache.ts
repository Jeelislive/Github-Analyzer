// Lightweight in-memory server cache with optional ETag support
// Note: This resets on server restart/hot reload.

export type CacheEntry<T = any> = {
  etag?: string
  data: T
  fetchedAt: number // epoch ms
  ttlMs?: number
}

const cache = new Map<string, CacheEntry>()

export function getCache<T = any>(key: string): CacheEntry<T> | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (entry.ttlMs && Date.now() - entry.fetchedAt > entry.ttlMs) {
    cache.delete(key)
    return undefined
  }
  return entry
}

export function setCache<T = any>(key: string, entry: CacheEntry<T>) {
  cache.set(key, { ...entry, fetchedAt: Date.now() })
}

export function delCache(key: string) {
  cache.delete(key)
}

export function getEtag(key: string): string | undefined {
  return cache.get(key)?.etag
}
