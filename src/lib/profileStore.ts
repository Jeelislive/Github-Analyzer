// Simple in-memory client-side profile store to avoid refetching across route changes
// Note: Module-level state persists across client route transitions in Next.js (same tab)
export type ProfileData = any

let cachedProfile: ProfileData | null = null
let cachedAt = 0

export function getProfile(): ProfileData | null {
  return cachedProfile
}

export function setProfile(data: ProfileData) {
  cachedProfile = data
  cachedAt = Date.now()
}

export function clearProfile() {
  cachedProfile = null
  cachedAt = 0
}

export function getProfileAgeMs(): number {
  return cachedAt ? Date.now() - cachedAt : Number.POSITIVE_INFINITY
}
