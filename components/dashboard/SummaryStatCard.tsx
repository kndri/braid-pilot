import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryStatCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  loading?: boolean
}

export function SummaryStatCard({
  title,
  value,
  delta,
  deltaLabel = 'Form last month',
  icon: Icon,
  loading = false
}: SummaryStatCardProps) {
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
          <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {delta !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className="text-gray-500">{deltaLabel}</span>
              <span className={cn(
                'flex items-center font-medium',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                !isPositive && !isNegative && 'text-gray-600'
              )}>
                {isPositive && <TrendingUp className="h-3 w-3 mr-0.5" />}
                {isNegative && <TrendingDown className="h-3 w-3 mr-0.5" />}
                {isPositive && '+'}
                {delta.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  )
}