"use client"

import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import './chartjs-setup'

export default function DoughnutChartJS({
  labels,
  values,
  colors,
  title,
  cutout = '60%'
}: {
  labels: string[]
  values: number[]
  colors?: string[]
  title?: string
  cutout?: string | number
}) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors || ['#7c3aed','#10b981','#6366f1','#f59e0b','#ef4444','#14b8a6','#8b5cf6'],
        borderWidth: 0,
      },
    ],
  }
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: { legend: { position: 'right' }, title: { display: !!title, text: title } },
  }
  return <div className="h-64"><Doughnut data={data} options={options} /></div>
}
