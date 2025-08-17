import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceData {
  label: string
  value: number
  total: number
  percentOfTarget: number
  trend?: 'up' | 'down'
  trendValue?: number
}

interface BalanceOverviewProps {
  className?: string
  totalBalance?: string
  incomeAmount?: string
  expenseAmount?: string
  data?: BalanceData[]
  loading?: boolean
}

const defaultData: BalanceData[] = [
  { 
    label: 'Property', 
    value: 15.780, 
    total: 20, 
    percentOfTarget: 65,
    trend: 'down',
    trendValue: 5
  },
  { 
    label: 'Revenue', 
    value: 78.3, 
    total: 100, 
    percentOfTarget: 80,
    trend: 'up',
    trendValue: 12
  },
  { 
    label: 'Customer', 
    value: 9.154, 
    total: 15, 
    percentOfTarget: 40,
    trend: 'up',
    trendValue: 8
  },
]

export function BalanceOverview({ 
  className, 
  totalBalance = '$117,000.43',
  incomeAmount = '$13,321.12',
  expenseAmount = '$13,321.12',
  data = defaultData,
  loading = false 
}: BalanceOverviewProps) {
  if (loading) {
    return (
      <div className={cn("rounded-lg border border-gray-200 bg-white p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 w-40 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-6", className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Balance</h3>
        <button className="rounded-lg p-1 hover:bg-gray-100">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Total Balance */}
      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-900">{totalBalance}</p>
        <div className="mt-3 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Income</span>
            <span className="font-medium text-gray-900">{incomeAmount}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-gray-600">Expense</span>
            <span className="font-medium text-gray-900">{expenseAmount}</span>
          </div>
        </div>
      </div>

      {/* Progress Items */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                {item.trend && (
                  <span className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    item.trend === 'up' ? "text-green-600" : "text-red-600"
                  )}>
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {item.trendValue}% Of Target
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {item.value}k
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                  item.percentOfTarget >= 60 ? "bg-orange-400" : "bg-orange-300"
                )}
                style={{ width: `${item.percentOfTarget}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}