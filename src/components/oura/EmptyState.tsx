'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Moon, Activity, Heart, Zap, AlertCircle } from 'lucide-react'

export interface EmptyStateProps {
  title: string
  message: string
  icon?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  moon: Moon,
  activity: Activity,
  heart: Heart,
  zap: Zap,
  alert: AlertCircle,
}

export function EmptyState({ title, message, icon = 'alert' }: EmptyStateProps) {
  const IconComponent = iconMap[icon.toLowerCase()] || AlertCircle

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </CardContent>
    </Card>
  )
}
