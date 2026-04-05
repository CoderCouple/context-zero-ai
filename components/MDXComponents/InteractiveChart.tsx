'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  name: string
  value: number
  value2?: number
}

interface InteractiveChartProps {
  data?: DataPoint[]
  type?: 'line' | 'bar'
  title?: string
  color?: string
  color2?: string
}

export default function InteractiveChart({
  data: initialData,
  type = 'line',
  title = 'Interactive Chart',
  color = '#3B82F6',
  color2 = '#10B981',
}: InteractiveChartProps) {
  const defaultData = [
    { name: 'Jan', value: 400, value2: 240 },
    { name: 'Feb', value: 300, value2: 139 },
    { name: 'Mar', value: 200, value2: 380 },
    { name: 'Apr', value: 278, value2: 390 },
    { name: 'May', value: 189, value2: 480 },
    { name: 'Jun', value: 239, value2: 380 },
  ]

  const [data, setData] = useState(initialData || defaultData)
  const [chartType, setChartType] = useState(type)
  const [animationKey, setAnimationKey] = useState(0)

  const randomizeData = () => {
    const newData = data.map((item) => ({
      ...item,
      value: Math.floor(Math.random() * 500) + 100,
      value2: item.value2 ? Math.floor(Math.random() * 500) + 100 : undefined,
    }))
    setData(newData)
    setAnimationKey((prev) => prev + 1)
  }

  const ChartComponent = chartType === 'line' ? LineChart : BarChart
  const DataComponent = chartType === 'line' ? Line : Bar

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
            className="rounded bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Switch to {chartType === 'line' ? 'Bar' : 'Line'}
          </button>
          <button
            onClick={randomizeData}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
          >
            Randomize Data
          </button>
        </div>
      </div>

      <div className="bg-white p-4 dark:bg-gray-900">
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent key={animationKey} data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <DataComponent
              dataKey="value"
              stroke={color}
              fill={color}
              name="Series 1"
              animationDuration={1000}
            />
            {data[0]?.value2 !== undefined && (
              <DataComponent
                dataKey="value2"
                stroke={color2}
                fill={color2}
                name="Series 2"
                animationDuration={1000}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
