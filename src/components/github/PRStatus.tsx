import React from 'react'

export type PRState = 'open' | 'closed'

interface PRStatusProps {
  state: PRState
  merged: boolean
  className?: string
}

export default function PRStatus({ state, merged, className }: PRStatusProps) {
  const appearance = getStatusAppearance(state, merged)
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${appearance.container} ${className || ''}`.trim()}>
      <span className={`h-1.5 w-1.5 rounded-full ${appearance.dot}`}></span>
      {appearance.label}
    </span>
  )
}

export function getStatusAppearance(state: PRState, merged: boolean) {
  if (state === 'open') {
    return { label: 'open', container: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' }
  }
  if (merged) {
    return { label: 'merged', container: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' }
  }
  return { label: 'closed', container: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' }
}
