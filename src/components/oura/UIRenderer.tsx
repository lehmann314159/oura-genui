'use client'

import { MetricsCard, type MetricsCardProps } from './MetricsCard'
import { SleepStages, type SleepStagesProps } from './SleepStages'
import { LineChart, type LineChartProps } from './LineChart'
import { ReadinessBreakdown, type ReadinessBreakdownProps } from './ReadinessBreakdown'
import { StatComparison, type StatComparisonProps } from './StatComparison'
import { SleepTimeline, type SleepTimelineProps } from './SleepTimeline'
import { EmptyState, type EmptyStateProps } from './EmptyState'

// Define the component types that the LLM can generate
export type UIComponent =
  | { type: 'metrics_card' } & MetricsCardProps
  | { type: 'sleep_stages' } & SleepStagesProps
  | { type: 'line_chart' } & LineChartProps
  | { type: 'readiness_breakdown' } & ReadinessBreakdownProps
  | { type: 'stat_comparison' } & StatComparisonProps
  | { type: 'sleep_timeline' } & SleepTimelineProps
  | { type: 'empty_state' } & EmptyStateProps

export interface UIRendererProps {
  components: UIComponent[]
}

/**
 * Renders a list of UI components based on JSON definitions from the LLM.
 * This is the core of the generative UI system.
 */
export function UIRenderer({ components }: UIRendererProps) {
  if (!components || components.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {components.map((component, index) => {
        switch (component.type) {
          case 'metrics_card':
            return (
              <MetricsCard
                key={index}
                title={component.title}
                metrics={component.metrics}
              />
            )
          case 'sleep_stages':
            return (
              <SleepStages
                key={index}
                deep={component.deep}
                rem={component.rem}
                light={component.light}
                awake={component.awake}
              />
            )
          case 'line_chart':
            return (
              <LineChart
                key={index}
                title={component.title}
                data={component.data}
                yAxisLabel={component.yAxisLabel}
                color={component.color}
              />
            )
          case 'readiness_breakdown':
            return (
              <ReadinessBreakdown
                key={index}
                score={component.score}
                contributors={component.contributors}
              />
            )
          case 'stat_comparison':
            return (
              <StatComparison
                key={index}
                title={component.title}
                current={component.current}
                previous={component.previous}
                unit={component.unit}
                higherIsBetter={component.higherIsBetter}
              />
            )
          case 'sleep_timeline':
            return (
              <SleepTimeline
                key={index}
                bedtime_start={component.bedtime_start}
                bedtime_end={component.bedtime_end}
                stages={component.stages}
              />
            )
          case 'empty_state':
            return (
              <EmptyState
                key={index}
                title={component.title}
                message={component.message}
                icon={component.icon}
              />
            )
          default:
            console.warn('Unknown component type:', component)
            return null
        }
      })}
    </div>
  )
}

/**
 * Parse UI components from LLM response.
 * The LLM should return JSON with a "ui" field containing an array of components.
 */
export function parseUIComponents(response: string): UIComponent[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/)
    const jsonString = jsonMatch ? jsonMatch[1] : response

    const parsed = JSON.parse(jsonString)

    if (Array.isArray(parsed)) {
      return parsed
    }

    if (parsed.ui && Array.isArray(parsed.ui)) {
      return parsed.ui
    }

    if (parsed.components && Array.isArray(parsed.components)) {
      return parsed.components
    }

    return []
  } catch {
    console.warn('Failed to parse UI components from response')
    return []
  }
}
