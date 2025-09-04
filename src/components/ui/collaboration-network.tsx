'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GeminiRepositoryInsights } from '@/lib/gemini-analyzer'

interface CollaborationNetworkProps {
  data: GeminiRepositoryInsights['visualizations']['collaborationNetwork']
  className?: string
}

// Extend the contributor data to include D3 simulation properties
interface SimulationNode extends d3.SimulationNodeDatum {
  contributor: string
  role: string
  expertise: string[]
  influence: number
}

export default function CollaborationNetwork({ data, className = '' }: CollaborationNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400

    // Convert data to simulation nodes with proper typing
    const nodes: SimulationNode[] = data.map(d => ({
      ...d,
      x: Math.random() * width,
      y: Math.random() * height
    }))

    // Create simulation with proper typing
    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force('charge', d3.forceManyBody<SimulationNode>().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimulationNode>().radius(30))

    // Create node groups
    const nodeGroups = svg.selectAll<SVGGElement, SimulationNode>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')

    // Add circles for contributors
    nodeGroups.append('circle')
      .attr('r', d => Math.max(8, d.influence * 3))
      .attr('fill', d => {
        switch (d.role) {
          case 'Lead Developer': return '#ef4444'
          case 'Core Contributor': return '#f97316'
          case 'Regular Contributor': return '#eab308'
          default: return '#6b7280'
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Add contributor name labels
    nodeGroups.append('text')
      .attr('dx', 0)
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text(d => d.contributor.length > 10 ? d.contributor.substring(0, 10) + '...' : d.contributor)

    // Add role labels
    nodeGroups.append('text')
      .attr('dx', 0)
      .attr('dy', 37)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#6b7280')
      .text(d => d.role)

    // Update positions on simulation tick
    simulation.on('tick', () => {
      nodeGroups.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`)
    })

    // Add tooltip functionality
    const tooltip = d3.select('body').append('div')
      .attr('class', 'collaboration-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    nodeGroups
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(200).style('opacity', .9)
        tooltip.html(`
          <strong>${d.contributor}</strong><br/>
          Role: ${d.role}<br/>
          Influence: ${d.influence}/10<br/>
          Expertise: ${d.expertise.join(', ')}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        tooltip.transition().duration(500).style('opacity', 0)
      })

    return () => {
      d3.select('body').selectAll('.collaboration-tooltip').remove()
      simulation.stop()
    }
  }, [data])

  if (!data.length) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-gray-500">No collaboration data available</p>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Team Collaboration Network</h3>
      <div className="flex flex-col gap-4">
        <svg ref={svgRef} width="100%" height="400" viewBox="0 0 600 400" />
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Lead Developer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Core Contributor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Regular Contributor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Occasional Contributor</span>
          </div>
        </div>

        {/* Contributor Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {data.map((contributor, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{contributor.contributor}</h4>
                <Badge variant="outline">{contributor.role}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p>Influence: {contributor.influence}/10</p>
                <p>Expertise: {contributor.expertise.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}