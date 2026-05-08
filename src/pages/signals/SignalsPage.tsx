import { useState, useMemo } from 'react'
import { useSignals, useAssignCluster } from '@/hooks/useSignals'
import { useClusters } from '@/hooks/useClusters'
import { ImpactBadge, SegmentBadge, SourceBadge } from '@/components/ui/Badge'
import { cn, formatRelativeDate } from '@/lib/utils'
import {
  SOURCE_LABELS,
  SEGMENT_LABELS,
  IMPACT_LABELS,
  type Signal,
  type SignalSource,
  type UserSegment,
  type BusinessImpact,
} from '@/lib/types'
import { ExternalLink, Search, X } from 'lucide-react'

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface Filters {
  source: SignalSource | ''
  segment: UserSegment | ''
  impact: BusinessImpact | ''
  clustered: 'all' | 'clustered' | 'unclustered'
  search: string
}

const DEFAULT_FILTERS: Filters = {
  source: '',
  segment: '',
  impact: '',
  clustered: 'all',
  search: '',
}

const selectBase =
  'px-2.5 py-1.5 text-xs rounded-lg border bg-white text-grain-muted border-grain-border focus:outline-none focus:ring-2 focus:ring-grain-accent/25 focus:border-grain-accent transition-colors'

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const hasActive =
    filters.source || filters.segment || filters.impact ||
    filters.clustered !== 'all' || filters.search

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-grain-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search signals…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-7 pr-3 py-1.5 text-xs rounded-lg border bg-white text-grain-primary border-grain-border placeholder:text-grain-muted focus:outline-none focus:ring-2 focus:ring-grain-accent/25 focus:border-grain-accent w-44 transition-colors"
        />
      </div>

      <select
        value={filters.source}
        onChange={(e) => onChange({ ...filters, source: e.target.value as SignalSource | '' })}
        className={cn(selectBase, filters.source && 'border-grain-accent text-grain-primary font-medium')}
      >
        <option value="">All sources</option>
        {(Object.entries(SOURCE_LABELS) as [SignalSource, string][]).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      <select
        value={filters.segment}
        onChange={(e) => onChange({ ...filters, segment: e.target.value as UserSegment | '' })}
        className={cn(selectBase, filters.segment && 'border-grain-accent text-grain-primary font-medium')}
      >
        <option value="">All segments</option>
        {(Object.entries(SEGMENT_LABELS) as [UserSegment, string][]).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      <select
        value={filters.impact}
        onChange={(e) => onChange({ ...filters, impact: e.target.value as BusinessImpact | '' })}
        className={cn(selectBase, filters.impact && 'border-grain-accent text-grain-primary font-medium')}
      >
        <option value="">All impact</option>
        {(Object.entries(IMPACT_LABELS) as [BusinessImpact, string][]).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>

      <select
        value={filters.clustered}
        onChange={(e) => onChange({ ...filters, clustered: e.target.value as Filters['clustered'] })}
        className={cn(selectBase, filters.clustered !== 'all' && 'border-grain-accent text-grain-primary font-medium')}
      >
        <option value="all">All</option>
        <option value="clustered">Clustered</option>
        <option value="unclustered">Unclustered</option>
      </select>

      {hasActive && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 text-xs text-grain-muted hover:text-grain-primary transition-colors"
        >
          <X size={11} />
          Clear
        </button>
      )}
    </div>
  )
}

// ─── Cluster select ───────────────────────────────────────────────────────────

function ClusterSelect({ signal }: { signal: Signal }) {
  const { data: clusters } = useClusters()
  const assign = useAssignCluster()

  return (
    <select
      value={signal.cluster_id ?? ''}
      onChange={(e) => assign.mutate({ signalId: signal.id, clusterId: e.target.value || null })}
      disabled={assign.isPending}
      className="text-xs px-2 py-1 rounded-lg border bg-white text-grain-muted border-grain-border focus:outline-none focus:ring-1 focus:ring-grain-accent/30 focus:border-grain-accent transition-colors cursor-pointer disabled:opacity-50"
      style={{ color: signal.cluster_id ? '#18160F' : undefined, fontWeight: signal.cluster_id ? 500 : 400 }}
    >
      <option value="">Unclustered</option>
      {clusters?.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}

// ─── Signal row ───────────────────────────────────────────────────────────────

function SignalRow({ signal }: { signal: Signal }) {
  return (
    <div
      className={cn(
        'signal-row px-5 py-4 bg-white',
        signal.business_impact === 'high' && 'signal-row-high',
        signal.business_impact === 'medium' && 'signal-row-medium',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-grain-primary leading-snug" style={{ letterSpacing: '-0.005em' }}>
            {signal.problem_statement}
          </p>
          {signal.account_name && (
            <p className="text-xs text-grain-muted mt-0.5">
              {signal.account_name}
              {signal.account_mrr != null && (
                <span className="ml-1.5 font-medium" style={{ color: '#18160F' }}>
                  ${signal.account_mrr.toLocaleString()}/mo
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {signal.source_url && (
            <a
              href={signal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-grain-muted hover:text-grain-accent transition-colors"
              title="View source"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <span className="text-xs text-grain-muted">{formatRelativeDate(signal.signal_date)}</span>
        </div>
      </div>

      {signal.verbatim_quote && (
        <p
          className="mt-2 text-xs text-grain-muted italic pl-3"
          style={{ borderLeft: '2px solid #E8E6E1' }}
        >
          "{signal.verbatim_quote}"
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <SourceBadge source={signal.source} />
        <ImpactBadge impact={signal.business_impact} />
        {signal.segments.map((seg) => (
          <SegmentBadge key={seg} segment={seg} />
        ))}
        <div className="ml-auto">
          <ClusterSelect signal={signal} />
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignalsPage() {
  const { data: signals, isLoading, error } = useSignals()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    if (!signals) return []
    return signals.filter((s) => {
      if (filters.source && s.source !== filters.source) return false
      if (filters.segment && !s.segments.includes(filters.segment as UserSegment)) return false
      if (filters.impact && s.business_impact !== filters.impact) return false
      if (filters.clustered === 'clustered' && !s.cluster_id) return false
      if (filters.clustered === 'unclustered' && s.cluster_id) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !s.problem_statement.toLowerCase().includes(q) &&
          !s.verbatim_quote?.toLowerCase().includes(q) &&
          !s.account_name?.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [signals, filters])

  const hasFilters =
    filters.source || filters.segment || filters.impact ||
    filters.clustered !== 'all' || filters.search

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Signals</h1>
        <p className="text-sm text-grain-muted mt-1">
          Every piece of user feedback your team has logged.
        </p>
      </div>

      {isLoading && <div className="text-sm text-grain-muted py-8 text-center">Loading…</div>}
      {error && <div className="text-sm text-red-500">Failed to load signals.</div>}

      {!isLoading && signals && signals.length > 0 && (
        <FilterBar filters={filters} onChange={setFilters} />
      )}

      {!isLoading && signals?.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-sm font-semibold text-grain-primary">No signals logged yet</p>
          <p className="text-sm text-grain-muted mt-1.5">
            Use the "Log signal" button above to capture your first user feedback.
          </p>
        </div>
      )}

      {!isLoading && signals && signals.length > 0 && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-sm font-semibold text-grain-primary">No signals match these filters</p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-xs text-grain-accent hover:underline mt-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {hasFilters && (
            <p className="text-xs text-grain-muted mb-3">
              {filtered.length} of {signals?.length} signals
            </p>
          )}
          <div className="card overflow-hidden divide-y divide-grain-border">
            {filtered.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
