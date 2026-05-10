import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/Badge'
import { formatRelativeDate } from '@/lib/utils'
import type { ClusterWithCount } from '@/hooks/useClusters'

interface ClusterCardProps {
  cluster: ClusterWithCount
}

export default function ClusterCard({ cluster }: ClusterCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/clusters/${cluster.id}`)}
      className="card card-interactive w-full text-left p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-grain-primary leading-snug mb-1.5"
            style={{ letterSpacing: '-0.01em' }}
          >
            {cluster.name}
          </h3>
          <StatusBadge status={cluster.status} />
          <p className="mt-2 text-xs text-grain-muted leading-relaxed line-clamp-2">
            {cluster.description}
          </p>
        </div>

        {/* Signal count — amber only here */}
        <div className="shrink-0 text-right">
          <p
            className="text-3xl font-bold leading-none tabular-nums text-grain-accent"
            style={{ letterSpacing: '-0.02em' }}
          >
            {cluster.signal_count}
          </p>
          <p className="text-xs text-grain-muted mt-0.5">
            feedback
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3" style={{ borderTop: '1px solid #E8E6E1' }}>
        <p className="text-xs text-grain-muted">
          {cluster.last_signal_date
            ? `Last feedback ${formatRelativeDate(cluster.last_signal_date)}`
            : 'No feedback yet'}
        </p>
      </div>
    </button>
  )
}
