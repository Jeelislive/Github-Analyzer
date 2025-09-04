'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

interface EvolutionTimelineProps {
  data: GeminiRepositoryInsights['visualizations']['evolutionTimeline']
  className?: string
}

interface TimelineDataPoint {
  date: string
  milestone: string
  type: 'feature' | 'refactor' | 'bugfix' | 'architecture'
  impact: number
  parsedDate: Date
}

export default function EvolutionTimeline({ data, className = '' }: EvolutionTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 300
    const margin = { top: 20, right: 20, bottom: 60, left: 20 }

    // Parse dates and sort data with proper typing
    const parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%SZ')
    const sortedData: TimelineDataPoint[] = data
      .map(d => ({ ...d, parsedDate: parseDate(d.date) || new Date() }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(sortedData, d => d.parsedDate) as [Date, Date])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.impact) || 10])
      .range([height - margin.bottom, margin.top])

    // Color scale for commit types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['feature', 'refactor', 'bugfix', 'architecture'])
      .range(['#10b981', '#3b82f6', '#ef4444', '#8b5cf6'])

    // Create line generator
    const line = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.impact))
      .curve(d3.curveMonotoneX)

    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f8fafc')

    // Add grid lines
    const xAxis = d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom)
    const yAxis = d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right)

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)

    // Remove grid text
    svg.selectAll('.grid text').remove()
    svg.selectAll('.grid path').remove()

    // Add evolution line
    svg.append('path')
      .datum(sortedData)
      .attr('fill', 'none')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)
      .attr('d', line)

    // Add circles for commits
    const circles = svg.selectAll('.commit-circle')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'commit-circle')
      .attr('cx', d => xScale(d.parsedDate))
      .attr('cy', d => yScale(d.impact))
      .attr('r', d => Math.max(3, d.impact / 2))
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    // Add x-axis with proper tick formatting
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
          .tickFormat((domainValue: d3.AxisDomain) => {
            // Safely cast to Date since we know xScale returns Date values
            const date = domainValue as Date
            return d3.timeFormat('%m/%d')(date)
          })
      )
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')

    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left - 5)
      .attr('x', -(height / 2))
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('Impact (files changed)')

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'timeline-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('max-width', '300px')
      .style('z-index', '1000')

    circles
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', Math.max(5, d.impact / 2 + 2))
        
        tooltip.transition().duration(200).style('opacity', 1)
        tooltip.html(`
          <div style="border-left: 3px solid ${colorScale(d.type)}; padding-left: 8px;">
            <strong>${d.type.toUpperCase()}</strong><br/>
            <em>${d3.timeFormat('%B %d, %Y')(d.parsedDate)}</em><br/>
            <strong>Impact:</strong> ${d.impact} files<br/>
            <strong>Commit:</strong> ${d.milestone.length > 50 ? d.milestone.substring(0, 50) + '...' : d.milestone}
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('r', Math.max(3, d.impact / 2))
        tooltip.transition().duration(300).style('opacity', 0)
      })

    return () => {
      d3.select('body').selectAll('.timeline-tooltip').remove()
    }
  }, [data])

  if (!data.length) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-gray-500">No evolution timeline data available</p>
      </Card>
    )
  }

  // Group data by type for stats
  const typeStats = data.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Project Evolution Timeline</h3>
        <div className="flex gap-2">
          {Object.entries(typeStats).map(([type, count]) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}: {count}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 800 300" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Feature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Refactor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Bug Fix</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Architecture</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium mb-3">Recent Activity</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div 
                className="w-2 h-2 rounded-full mt-2"
                style={{ 
                  backgroundColor: 
                    item.type === 'feature' ? '#10b981' :
                    item.type === 'refactor' ? '#3b82f6' :
                    item.type === 'bugfix' ? '#ef4444' : '#8b5cf6'
                }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-700">{item.milestone}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleDateString()} • {item.impact} files
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}