'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'

interface ChartData {
  month: string
  income: number
  expenses: number
}

interface IncomeAnalyticsProps {
  className?: string
  data?: ChartData[]
  loading?: boolean
}

const defaultData: ChartData[] = [
  { month: 'Jan', income: 4200, expenses: 2100 },
  { month: 'Feb', income: 3800, expenses: 1900 },
  { month: 'Mar', income: 4500, expenses: 2250 },
  { month: 'Apr', income: 4100, expenses: 2050 },
  { month: 'May', income: 5720, expenses: 2720 },
  { month: 'Jun', income: 4900, expenses: 2450 },
  { month: 'Jul', income: 5300, expenses: 2650 },
  { month: 'Aug', income: 4800, expenses: 2400 },
  { month: 'Sep', income: 5100, expenses: 2550 },
  { month: 'Oct', income: 4600, expenses: 2300 },
  { month: 'Nov', income: 4950, expenses: 2475 },
  { month: 'Dec', income: 5400, expenses: 2700 },
]

export function IncomeAnalytics({ className, data = defaultData, loading = false }: IncomeAnalyticsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('year')

  const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expenses)))
  const chartHeight = 280
  const barWidth = 40
  const gap = 20

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-gray-200 bg-white p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-6", className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Income Analytics</h3>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-md transition-colors",
              selectedPeriod === 'month' 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-md transition-colors",
              selectedPeriod === 'year' 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-orange-400"></div>
          <span className="text-gray-600">Income</span>
          <span className="font-semibold text-gray-900">
            ${data.reduce((sum, d) => sum + d.income, 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-orange-200"></div>
          <span className="text-gray-600">Expenses</span>
          <span className="font-semibold text-gray-900">
            ${data.reduce((sum, d) => sum + d.expenses, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute -left-2 top-0 flex flex-col justify-between h-full text-xs text-gray-500">
          <span>${(maxValue / 1000).toFixed(0)}k</span>
          <span>${(maxValue * 0.75 / 1000).toFixed(0)}k</span>
          <span>${(maxValue * 0.5 / 1000).toFixed(0)}k</span>
          <span>${(maxValue * 0.25 / 1000).toFixed(0)}k</span>
          <span>$0</span>
        </div>

        {/* Grid lines */}
        <svg
          className="absolute inset-0 w-full"
          style={{ height: chartHeight }}
          preserveAspectRatio="none"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * (1 - ratio)}
              x2="100%"
              y2={chartHeight * (1 - ratio)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray={ratio === 0 ? "0" : "3 3"}
            />
          ))}
        </svg>

        {/* Bars */}
        <div className="relative flex justify-between items-end pl-8" style={{ height: chartHeight }}>
          {data.map((item, index) => {
            const incomeHeight = (item.income / maxValue) * chartHeight
            const expenseHeight = (item.expenses / maxValue) * chartHeight
            const isHovered = hoveredIndex === index
            const isMay = item.month === 'May'

            return (
              <div
                key={item.month}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ width: barWidth }}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-20 z-10 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                    <div className="font-medium">{item.month} 2023</div>
                    <div className="mt-1">Income: ${item.income.toLocaleString()}</div>
                    <div>Expenses: ${item.expenses.toLocaleString()}</div>
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                  </div>
                )}

                {/* Bars Container */}
                <div className="relative w-full flex justify-center gap-1">
                  {/* Income Bar */}
                  <div
                    className={cn(
                      "transition-all duration-200 rounded-t",
                      isMay ? "bg-orange-500" : "bg-orange-400",
                      isHovered && "opacity-80"
                    )}
                    style={{
                      height: incomeHeight,
                      width: barWidth / 2 - 2
                    }}
                  />
                  {/* Expense Bar */}
                  <div
                    className={cn(
                      "transition-all duration-200 rounded-t",
                      isMay ? "bg-orange-300" : "bg-orange-200",
                      isHovered && "opacity-80"
                    )}
                    style={{
                      height: expenseHeight,
                      width: barWidth / 2 - 2
                    }}
                  />
                </div>

                {/* Month label */}
                <div className="absolute -bottom-6 text-xs text-gray-500">{item.month}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}