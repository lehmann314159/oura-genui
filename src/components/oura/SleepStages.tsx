'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'

export interface SleepStagesProps {
  deep: number    // minutes
  rem: number     // minutes
  light: number   // minutes
  awake: number   // minutes
}

const stageColors = {
  deep: 'bg-indigo-600',
  rem: 'bg-purple-500',
  light: 'bg-blue-400',
  awake: 'bg-orange-400',
}

const stageLabels = {
  deep: 'Deep Sleep',
  rem: 'REM Sleep',
  light: 'Light Sleep',
  awake: 'Awake',
}

export function SleepStages({ deep, rem, light, awake }: SleepStagesProps) {
  const total = deep + rem + light + awake

  const stages = [
    { key: 'deep' as const, value: deep },
    { key: 'rem' as const, value: rem },
    { key: 'light' as const, value: light },
    { key: 'awake' as const, value: awake },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Sleep Stages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked bar */}
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {stages.map(({ key, value }) => (
            <div
              key={key}
              className={`${stageColors[key]} transition-all`}
              style={{ width: `${(value / total) * 100}%` }}
              title={`${stageLabels[key]}: ${formatDuration(value)}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stages.map(({ key, value }) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${stageColors[key]}`} />
              <div>
                <p className="text-xs text-muted-foreground">{stageLabels[key]}</p>
                <p className="text-sm font-medium">{formatDuration(value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Time in Bed</span>
            <span className="font-medium">{formatDuration(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
