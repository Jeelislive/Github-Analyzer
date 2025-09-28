"use client"

import React, { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import './chartjsSetup'

export default function GaugeChartJS({
  value, // 0..1
  label = 'Rate',
  color = '#7c3aed',
}: {
  value: number
  label?: string
  color?: string
}) {
  const v = Math.max(0, Math.min(1, value))
  const data = useMemo(() => ({
    labels: [label, ''],
    datasets: [
      {
        data: [Math.round(v * 100), Math.round(100 - v * 100)],
        backgroundColor: [color, '#e5e7eb'],
        borderWidth: 0,
        cutout: '70%',
        circumference: 180,
        rotation: -90,
      },
    ],
  }), [v, color, label])

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  }

  return (
    <div className="h-40 relative">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-end justify-center pb-6">
        <div className="text-xl font-semibold">{Math.round(v * 100)}%</div>
      </div>
    </div>
  )
}
