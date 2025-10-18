"use client"

import React, { useState, useMemo } from 'react'
import { format, parseISO, startOfYear, endOfYear, eachDayOfInterval, getDay, getWeek, getMonth } from 'date-fns'

export type HeatmapDay = {
  date: string
  contributionCount: number
  color: string
  weekday: number
}

interface ContributionHeatmapProps {
  days: HeatmapDay[]
  showMonthLabels?: boolean
  showWeekdayLabels?: boolean
  cellSize?: number
  cellGap?: number
}

export default function ContributionHeatmap({ 
  days, 
  showMonthLabels = true, 
  showWeekdayLabels = true,
  cellSize = 12,
  cellGap = 2
}: ContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const { weeks, monthLabels, maxContributions } = useMemo(() => {
    if (!days.length) return { weeks: [], monthLabels: [], maxContributions: 0 }

    const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))
    const maxContributions = Math.max(...sortedDays.map(d => d.contributionCount))
    
    const dayMap = new Map(sortedDays.map(day => [day.date, day]))
    
    const startDate = parseISO(sortedDays[0].date)
    const endDate = parseISO(sortedDays[sortedDays.length - 1].date)
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    
    const weeks: (HeatmapDay | null)[][] = []
    let currentWeek: (HeatmapDay | null)[] = []
    
    const firstDay = allDays[0]
    const startWeekday = getDay(firstDay)
    
    for (let i = 0; i < startWeekday; i++) {
      currentWeek.push(null)
    }
    
    allDays.forEach((date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayData = dayMap.get(dateStr) || {
        date: dateStr,
        contributionCount: 0,
        color: '#f0f0f0',
        weekday: getDay(date)
      }
      
      currentWeek.push(dayData)
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }
    
    const monthLabels: { label: string; weekIndex: number }[] = []
    const seenMonths = new Set()
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(day => day !== null)
      if (firstDayOfWeek) {
        const month = getMonth(parseISO(firstDayOfWeek.date))
        const monthLabel = format(parseISO(firstDayOfWeek.date), 'MMM')
        
        if (!seenMonths.has(month) && weekIndex > 0) {
          monthLabels.push({ label: monthLabel, weekIndex })
          seenMonths.add(month)
        }
      }
    })
    
    return { weeks, monthLabels, maxContributions }
  }, [days])

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'contribution-0'
    const intensity = Math.ceil((count / maxContributions) * 4)
    return `contribution-${Math.min(intensity, 4)}`
  }

  const handleMouseEnter = (day: HeatmapDay, event: React.MouseEvent) => {
    setHoveredDay(day)
    setMousePosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="contribution-heatmap">
      <style jsx>{`
        .contribution-heatmap {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .contribution-cell {
          transition: all 0.2s ease;
          cursor: pointer;
          border-radius: 2px;
        }
        
        .contribution-cell:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          z-index: 10;
          position: relative;
        }
        
        .contribution-0 { 
          background-color: #f0f0f0; 
          border: 1px solid #e1e4e8;
        }
        .contribution-1 { 
          background-color: #c6e48b; 
          border: 1px solid #b8dc7a;
        }
        .contribution-2 { 
          background-color: #7bc96f; 
          border: 1px solid #6bb862;
        }
        .contribution-3 { 
          background-color: #239a3b; 
          border: 1px solid #1e8a32;
        }
        .contribution-4 { 
          background-color: #196127; 
          border: 1px solid #155420;
        }
        
        .month-label {
          font-size: 12px;
          font-weight: 500;
          color: #586069;
          margin-bottom: 4px;
        }
        
        .weekday-label {
          font-size: 11px;
          color: #586069;
          text-align: center;
          line-height: 1;
        }
        
        .tooltip {
          position: fixed;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }
        
        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
        }
      `}</style>
      
      <div className="flex">
        {/* Weekday labels */}
        {showWeekdayLabels && (
          <div className="flex flex-col mr-2" style={{ marginTop: showMonthLabels ? '20px' : '0' }}>
            {weekdayLabels.map((label, index) => (
              <div
                key={label}
                className="weekday-label"
                style={{ 
                  height: `${cellSize}px`,
                  marginBottom: `${cellGap}px`,
                  display: index % 2 === 1 ? 'flex' : 'none',
                  alignItems: 'center'
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex-1">
          {/* Month labels */}
          {showMonthLabels && (
            <div className="flex mb-2" style={{ height: '20px' }}>
              {monthLabels.map(({ label, weekIndex }) => (
                <div
                  key={`${label}-${weekIndex}`}
                  className="month-label"
                  style={{
                    marginLeft: `${weekIndex * (cellSize + cellGap)}px`,
                    position: 'absolute'
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
          
          {/* Heatmap grid */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`contribution-cell ${day ? getIntensityClass(day.contributionCount) : 'contribution-0'}`}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      opacity: day ? 1 : 0.3
                    }}
                    onMouseEnter={day ? (e) => handleMouseEnter(day, e) : undefined}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`contribution-${level}`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
      
      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="tooltip"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y - 50}px`
          }}
        >
          <div>
            <strong>{hoveredDay.contributionCount}</strong> contribution{hoveredDay.contributionCount !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            {format(parseISO(hoveredDay.date), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      )}
    </div>
  )
}
