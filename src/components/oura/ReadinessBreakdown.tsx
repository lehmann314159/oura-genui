'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ReadinessBreakdownProps {
  score: number
  contributors: {
    activity_balance: number
    body_temperature: number
    hrv_balance: number
    previous_day_activity: number
    previous_night: number
    recovery_index: number
    resting_heart_rate: number
    sleep_balance: number
  }
}

const contributorLabels: Record<string, string> = {
  activity_balance: 'Activity Balance',
  body_temperature: 'Body Temperature',
  hrv_balance: 'HRV Balance',
  previous_day_activity: 'Previous Day Activity',
  previous_night: 'Previous Night',
  recovery_index: 'Recovery Index',
  resting_heart_rate: 'Resting Heart Rate',
  sleep_balance: 'Sleep Balance',
}

function getScoreColor(value: number): string {
  if (value >= 80) return 'bg-green-500'
  if (value >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreTextColor(value: number): string {
  if (value >= 80) return 'text-green-600'
  if (value >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function ReadinessBreakdown({ score, contributors }: ReadinessBreakdownProps) {
  // Sort contributors by value (lowest first to highlight areas needing attention)
  const sortedContributors = Object.entries(contributors)
    .map(([key, value]) => ({
      key,
      label: contributorLabels[key] || key,
      value,
    }))
    .sort((a, b) => a.value - b.value)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Readiness Breakdown</CardTitle>
          <div className={cn('text-2xl font-bold', getScoreTextColor(score))}>
            {score}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedContributors.map(({ key, label, value }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-medium', getScoreTextColor(value))}>
                  {value}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', getScoreColor(value))}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
