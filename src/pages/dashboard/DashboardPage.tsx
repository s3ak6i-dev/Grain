import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import { useClusters, useUnclusteredCount } from '@/hooks/useClusters'
import ClusterCard from '@/components/clusters/ClusterCard'
import CreateClusterModal from '@/components/clusters/CreateClusterModal'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: clusters, isLoading } = useClusters()
  const { data: unclusteredCount } = useUnclusteredCount()

  const totalSignals = clusters?.reduce((sum, c) => sum + c.signal_count, 0) ?? 0

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-grain-muted mt-1 leading-relaxed">
            See which user problems keep coming up — and how many times.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 mt-0.5">
          <Plus size={14} />
          New problem
        </Button>
      </div>

      {/* Stat strip — only total signals gets accent color */}
      {!isLoading && clusters && clusters.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="card px-5 py-4">
            <p className="section-label mb-2">Total feedback</p>
            <p
              className="text-4xl font-bold leading-none tabular-nums text-grain-accent"
              style={{ letterSpacing: '-0.02em' }}
            >
              {totalSignals}
            </p>
          </div>
          <div className="card px-5 py-4">
            <p className="section-label mb-2">Problems</p>
            <p
              className="text-4xl font-bold leading-none tabular-nums text-grain-primary"
              style={{ letterSpacing: '-0.02em' }}
            >
              {clusters.length}
            </p>
          </div>
          <div className="card px-5 py-4">
            <p className="section-label mb-2">Unassigned</p>
            <p
              className="text-4xl font-bold leading-none tabular-nums"
              style={{
                letterSpacing: '-0.02em',
                color: unclusteredCount ? '#18160F' : '#C8C6C2',
              }}
            >
              {unclusteredCount ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Unclustered nudge */}
      {!!unclusteredCount && unclusteredCount > 0 && (
        <div
          className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(217,119,6,0.06)',
            border: '1px solid rgba(217,119,6,0.16)',
          }}
        >
          <AlertCircle size={14} style={{ color: '#D97706' }} className="shrink-0" />
          <p className="text-sm" style={{ color: '#78350F' }}>
            <span className="font-semibold">{unclusteredCount}</span>{' '}
            {unclusteredCount === 1 ? 'feedback item is' : 'feedback items are'} unassigned. Assign them to a problem to surface patterns.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-sm text-grain-muted py-10 text-center">Loading…</div>
      )}

      {/* Empty state */}
      {!isLoading && clusters?.length === 0 && (
        <div className="card p-14 text-center">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.14)' }}
          >
            <Plus size={18} style={{ color: '#D97706' }} />
          </div>
          <p className="text-sm font-semibold text-grain-primary" style={{ letterSpacing: '-0.01em' }}>
            No problems yet
          </p>
          <p className="text-sm text-grain-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
            Create a problem and assign feedback to it — that's when patterns start to emerge.
          </p>
          <Button
            size="sm"
            className="mt-5 inline-flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            Create first problem
          </Button>
        </div>
      )}

      {/* Cluster grid */}
      {clusters && clusters.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      )}

      <CreateClusterModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
