'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SleepTimelineProps {
  bedtime_start: string
  bedtime_end: string
  stages: string // Each character: 1=deep, 2=light, 3=REM, 4=awake
}

const stageColors: Record<string, string> = {
  '1': 'bg-indigo-600',  // Deep
  '2': 'bg-blue-400',    // Light
  '3': 'bg-purple-500',  // REM
  '4': 'bg-orange-400',  // Awake
}

const stageLabels: Record<string, string> = {
  '1': 'Deep',
  '2': 'Light',
  '3': 'REM',
  '4': 'Awake',
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function SleepTimeline({ bedtime_start, bedtime_end, stages }: SleepTimelineProps) {
  // Group consecutive same-stage periods for cleaner rendering
  const segments: Array<{ stage: string; count: number }> = []
  let currentStage = ''
  let currentCount = 0

  for (const char of stages) {
    if (char === currentStage) {
      currentCount++
    } else {
      if (currentStage) {
        segments.push({ stage: currentStage, count: currentCount })
      }
      currentStage = char
      currentCount = 1
    }
  }
  if (currentStage) {
    segments.push({ stage: currentStage, count: currentCount })
  }

  const totalSegments = stages.length

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sleep Timeline</CardTitle>
          <div className="text-sm text-muted-foreground">
            {formatTime(bedtime_start)} - {formatTime(bedtime_end)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline bar */}
        <div className="flex h-8 w-full rounded-md overflow-hidden">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`${stageColors[segment.stage] || 'bg-gray-400'} transition-all`}
              style={{ width: `${(segment.count / totalSegments) * 100}%` }}
              title={`${stageLabels[segment.stage]}: ${segment.count * 5} min`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {Object.entries(stageLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${stageColors[key]}`} />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatTime(bedtime_start)}</span>
          <span>{formatTime(bedtime_end)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
