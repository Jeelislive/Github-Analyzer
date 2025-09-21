"use client"

import React from 'react'

export type HeatmapDay = {
  date: string
  contributionCount: number
  color: string
  weekday: number
}

export default function ContributionHeatmap({ days }: { days: HeatmapDay[] }) {
  // Expect up to ~53 weeks * 7 days
  // Group by weeks based on order; days are expected to be sorted by API
  // We'll render as a simple grid with CSS columns representing weeks

  // Build weeks: an array of arrays (7 items each)
  const weeks: HeatmapDay[][] = []
  let currentWeek: HeatmapDay[] = []

  for (const d of days) {
    currentWeek.push(d)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length) {
    // pad to 7 to maintain layout
    while (currentWeek.length < 7) {
      currentWeek.push({ ...currentWeek[currentWeek.length - 1], contributionCount: 0, color: '#ebedf0' })
    }
    weeks.push(currentWeek)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-rows-7 gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.contributionCount} contributions`}
                className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] border border-gray-200/40"
                style={{ backgroundColor: day.color }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
