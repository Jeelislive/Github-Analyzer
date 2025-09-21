"use client"

import React from 'react'

export default function Tooltip({ x, y, children, visible }: { x: number; y: number; children: React.ReactNode; visible: boolean }) {
  if (!visible) return null
  return (
    <div
      style={{ left: x, top: y }}
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-white/95 px-2 py-1 text-xs text-gray-800 shadow-lg ring-1 ring-black/5"
    >
      {children}
    </div>
  )
}
