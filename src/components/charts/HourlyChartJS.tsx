"use client"

import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import './chartjs-setup'

export default function HourlyChartJS({
  data,
  title = 'Activity by Hour (UTC)',
}: {
  data: number[] // length 24
  title?: string
}) {
  const labels = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i}:00`), [])
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Events',
        data,
        backgroundColor: (ctx: any) => {
          const i = ctx.dataIndex
          const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
          grad.addColorStop(0, 'rgba(124, 58, 237, 0.9)')
          grad.addColorStop(1, 'rgba(124, 58, 237, 0.3)')
          return grad
        },
        borderRadius: 4,
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      },
    ],
  }), [data, labels])

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => items[0]?.label ?? '',
          label: (ctx: any) => `Events: ${ctx.formattedValue}`,
        },
      },
      title: { display: false, text: title },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', maxRotation: 0, autoSkip: true },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#6b7280', precision: 0 },
        beginAtZero: true,
      },
    },
    hover: { mode: 'index', intersect: false },
  }

  return (
    <div className="h-56">
      <Bar data={chartData} options={options} />
    </div>
  )
}
