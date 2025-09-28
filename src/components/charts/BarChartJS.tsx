"use client"

import React from 'react'
import { Bar } from 'react-chartjs-2'
import './chartjsSetup'

export default function BarChartJS({
  labels,
  values,
  color = '#7c3aed',
  title,
}: {
  labels: string[]
  values: number[]
  color?: string
  title?: string
}) {
  const data = {
    labels,
    datasets: [
      {
        label: title || 'Count',
        data: values,
        backgroundColor: (ctx: any) => {
          const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
          grad.addColorStop(0, color.replace('1)', '0.9)') || 'rgba(124,58,237,0.9)')
          grad.addColorStop(1, color.replace('1)', '0.3)') || 'rgba(124,58,237,0.3)')
          return grad
        },
        borderRadius: 4,
        maxBarThickness: 26,
      },
    ],
  }
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } },
    interaction: { mode: 'index', intersect: false },
  }
  return <div className="h-64"><Bar data={data} options={options} /></div>
}
