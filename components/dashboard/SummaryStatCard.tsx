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
      <div className="bg-white p-5">
        <div className="animate-pulse">
          <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-7 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-5">
      <div>
        <p className="text-xs text-gray-500 font-normal mb-2">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mb-2">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {delta !== undefined && (
          <p className="text-xs text-gray-500">
            <span className="text-gray-400">{deltaLabel} </span>
            <span className={cn(
              'font-medium',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600',
              !isPositive && !isNegative && 'text-gray-600'
            )}>
              {delta.toFixed(2)}%
            </span>
          </p>
        )}
      </div>
    </div>
  )
}