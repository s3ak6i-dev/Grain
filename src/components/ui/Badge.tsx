import { cn } from '@/lib/utils'
import type { BusinessImpact, ClusterStatus, SignalSource, UserSegment } from '@/lib/types'
import {
  IMPACT_LABELS,
  SEGMENT_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
} from '@/lib/types'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ImpactBadge({ impact }: { impact: BusinessImpact }) {
  return (
    <Badge
      className={cn({
        /* High: deep red, serious not garish */
        'border': true,
        'bg-[#FEF1F0] text-[#B91C1C] border-[#FECACA]': impact === 'high',
        /* Medium: deep amber, not orange */
        'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]': impact === 'medium',
        /* Low: invisible — neutral, not colored */
        'bg-grain-bg text-grain-muted border-grain-border': impact === 'low',
      })}
    >
      {IMPACT_LABELS[impact]}
    </Badge>
  )
}

export function SourceBadge({ source }: { source: SignalSource }) {
  return (
    <Badge className="bg-grain-bg text-grain-muted border border-grain-border">
      {SOURCE_LABELS[source]}
    </Badge>
  )
}

export function SegmentBadge({ segment }: { segment: UserSegment }) {
  return (
    <Badge className="bg-grain-bg text-grain-muted border border-grain-border">
      {SEGMENT_LABELS[segment]}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: ClusterStatus }) {
  return (
    <Badge
      className={cn('border', {
        /* Watching: neutral, passive */
        'bg-grain-bg text-grain-muted border-grain-border': status === 'watching',
        /* Investigating: blue, active inquiry */
        'bg-blue-50 text-blue-700 border-blue-200': status === 'investigating',
        /* In Roadmap: green, committed */
        'bg-emerald-50 text-emerald-700 border-emerald-200': status === 'in_roadmap',
        /* Won't Solve: visually deprioritized */
        'bg-grain-bg text-grain-muted/60 border-grain-border line-through': status === 'wont_solve',
      })}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
