'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatComparisonProps {
  title: string
  current: { label: string; value: string | number }
  previous: { label: string; value: string | number }
  unit?: string
  higherIsBetter?: boolean
}

export function StatComparison({
  title,
  current,
  previous,
  unit = '',
  higherIsBetter = true,
}: StatComparisonProps) {
  // Calculate the difference for numeric values
  const currentNum = typeof current.value === 'number' ? current.value : parseFloat(String(current.value))
  const previousNum = typeof previous.value === 'number' ? previous.value : parseFloat(String(previous.value))

  const hasNumericValues = !isNaN(currentNum) && !isNaN(previousNum)
  const diff = hasNumericValues ? currentNum - previousNum : 0
  const percentChange = hasNumericValues && previousNum !== 0
    ? ((diff / previousNum) * 100).toFixed(1)
    : null

  const isImproved = hasNumericValues && (higherIsBetter ? diff > 0 : diff < 0)
  const isDeclined = hasNumericValues && (higherIsBetter ? diff < 0 : diff > 0)
  const isNeutral = !hasNumericValues || diff === 0

  const TrendIcon = isImproved ? TrendingUp : isDeclined ? TrendingDown : Minus
  const trendColor = isImproved
    ? 'text-green-600'
    : isDeclined
    ? 'text-red-600'
    : 'text-muted-foreground'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Current */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{current.label}</p>
            <p className="text-2xl font-bold">
              {current.value}
              {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
          </div>

          {/* Previous */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{previous.label}</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {previous.value}
              {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
            </p>
          </div>
        </div>

        {/* Trend indicator */}
        {hasNumericValues && (
          <div className={cn('flex items-center gap-2 mt-4 pt-4 border-t', trendColor)}>
            <TrendIcon className="h-5 w-5" />
            <span className="font-medium">
              {isNeutral ? 'No change' : (
                <>
                  {isImproved ? 'Improved' : 'Declined'} by {Math.abs(diff).toFixed(1)}
                  {percentChange && ` (${Math.abs(parseFloat(percentChange))}%)`}
                </>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
