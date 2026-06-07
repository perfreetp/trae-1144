import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-accent-400',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent-600/5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700/50',
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-accent-400' : 'text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-surface-400">{title}</p>
        <p className="mt-1 text-2xl font-bold font-mono text-surface-100">{value}</p>
      </div>
      {changeLabel && (
        <p className="mt-1 text-xs text-surface-500">{changeLabel}</p>
      )}
    </div>
  )
}
