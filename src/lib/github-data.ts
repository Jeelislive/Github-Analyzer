// Simple utility to get current visualized profile from localStorage
export function getCurrentVisualized(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('currentVisualized')
}

export function setCurrentVisualized(username: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentVisualized', username)
}

export function clearCurrentVisualized() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentVisualized')
}

// History management
export function getVisualizedHistory(): string[] {
  if (typeof window === 'undefined') return []
  const history = localStorage.getItem('visualizedHistory')
  return history ? JSON.parse(history) : []
}

export function addToHistory(username: string) {
  if (typeof window === 'undefined') return
  const history = getVisualizedHistory()
  if (!history.includes(username)) {
    history.unshift(username)
    localStorage.setItem('visualizedHistory', JSON.stringify(history.slice(0, 10)))
  }
}
