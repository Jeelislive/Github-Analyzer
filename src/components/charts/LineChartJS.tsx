"use client"

import React from 'react'
import { Line } from 'react-chartjs-2'
import './chartjs-setup'

export default function LineChartJS({
  labels,
  series, // [{label,color,data:number[]}, ...]
  title,
}: {
  labels: string[]
  series: Array<{ label: string; color: string; data: number[] }>
  title?: string
}) {
  const data = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color,
      tension: 0.35,
      pointRadius: 2,
      fill: false,
    })),
  }
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: !!title, text: title } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } },
    interaction: { mode: 'index', intersect: false },
  }
  return <div className="h-64"><Line data={data} options={options} /></div>
}
