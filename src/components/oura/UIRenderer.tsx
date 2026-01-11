'use client'

import { MetricsCard, type MetricsCardProps } from './MetricsCard'
import { SleepStages, type SleepStagesProps } from './SleepStages'

// Define the component types that the LLM can generate
export type UIComponent =
  | { type: 'metrics_card' } & MetricsCardProps
  | { type: 'sleep_stages' } & SleepStagesProps

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
