'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Moon, Activity, Heart, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  moon: Moon,
  activity: Activity,
  heart: Heart,
  zap: Zap,
  check: Activity,
}

interface Metric {
  label: string
  value: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface MetricsCardProps {
  title: string
  metrics: Metric[]
}

export function MetricsCard({ title, metrics }: MetricsCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon ? iconMap[metric.icon] : null

            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {Icon && (
                  <div className="rounded-md bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-semibold">{metric.value}</p>
                    {metric.trend && (
                      <span
                        className={cn(
                          'ml-1',
                          metric.trend === 'up' && 'text-green-500',
                          metric.trend === 'down' && 'text-red-500',
                          metric.trend === 'neutral' && 'text-muted-foreground'
                        )}
                      >
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                        {metric.trend === 'neutral' && <Minus className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
