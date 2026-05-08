import {
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalyticsSignals } from '@/hooks/useAnalytics'
import { useClusters } from '@/hooks/useClusters'
import {
  SOURCE_LABELS,
  SEGMENT_LABELS,
  STATUS_LABELS,
  type SignalSource,
  type UserSegment,
  type ClusterStatus,
} from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildVelocityData(signals: { signal_date: string }[]) {
  if (signals.length === 0) return []
  const weeks: Record<string, number> = {}
  signals.forEach(({ signal_date }) => {
    const d = new Date(signal_date)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    const monday = new Date(d)
    monday.setDate(d.getDate() + diff)
    const key = monday.toISOString().split('T')[0]
    weeks[key] = (weeks[key] ?? 0) + 1
  })
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, count]) => ({ week: getWeekLabel(date), count }))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  primary = false,
}: {
  label: string
  value: string | number
  sub?: string
  primary?: boolean
}) {
  return (
    <div className="card p-5 relative overflow-hidden">
      {primary && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 100% 0%, rgba(217,119,6,0.07) 0%, transparent 60%)',
          }}
        />
      )}
      <p className="section-label mb-3">{label}</p>
      <p
        className="font-bold leading-none tabular-nums"
        style={{
          fontSize: 40,
          letterSpacing: '-0.03em',
          color: primary ? '#D97706' : '#18160F',
        }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-grain-muted mt-2.5 leading-relaxed">{sub}</p>}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  watching: '#8C8984',
  investigating: '#2563EB',
  in_roadmap: '#16A34A',
  wont_solve: '#C4C2BE',
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(24,22,15,0.12), 0 0 0 1px rgba(24,22,15,0.06)',
      }}
    >
      <p className="text-grain-muted mb-0.5">{label}</p>
      <p className="font-semibold text-grain-primary">{payload[0].value} signals</p>
    </div>
  )
}

function ProgressRow({
  label,
  count,
  max,
  color,
}: {
  label: string
  count: number
  max: number
  color: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-grain-muted w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 rounded-full h-1.5" style={{ background: '#E8E6E1' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(count / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-grain-primary w-5 text-right tabular-nums">
        {count}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: signals, isLoading } = useAnalyticsSignals()
  const { data: clusters } = useClusters()

  if (isLoading) return <div className="text-sm text-grain-muted py-8">Loading…</div>

  const total = signals?.length ?? 0
  const clustered = signals?.filter((s) => s.cluster_id).length ?? 0
  const unclustered = total - clustered
  const highImpact = signals?.filter((s) => s.business_impact === 'high').length ?? 0

  const velocityData = buildVelocityData(signals ?? [])

  const sourceCounts: Record<string, number> = {}
  signals?.forEach((s) => { sourceCounts[s.source] = (sourceCounts[s.source] ?? 0) + 1 })
  const sourceData = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([src, count]) => ({ name: SOURCE_LABELS[src as SignalSource] ?? src, count }))

  const segCounts: Record<string, number> = {}
  signals?.forEach((s) =>
    s.segments.forEach((seg) => { segCounts[seg] = (segCounts[seg] ?? 0) + 1 }),
  )
  const segData = Object.entries(segCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([seg, count]) => ({ name: SEGMENT_LABELS[seg as UserSegment] ?? seg, count }))

  const statusCounts: Record<string, number> = {}
  clusters?.forEach((c) => { statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1 })
  const statusData = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      status,
      name: STATUS_LABELS[status as ClusterStatus] ?? status,
      count,
    }))

  const maxSource = Math.max(...sourceData.map((d) => d.count), 1)
  const maxSeg = Math.max(...segData.map((d) => d.count), 1)
  const maxStatus = Math.max(...statusData.map((d) => d.count), 1)

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="page-title">Analytics</h1>
        <p className="text-sm text-grain-muted mt-1">
          Signal patterns and workspace health at a glance.
        </p>
      </div>

      {total === 0 && (
        <div className="card p-10 text-center">
          <p className="text-sm font-semibold text-grain-primary">No data yet</p>
          <p className="text-sm text-grain-muted mt-1.5">Log signals to start seeing analytics here.</p>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-col gap-5">
          {/* KPI row — only Total gets accent color */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Total signals" value={total} primary />
            <KpiCard
              label="High impact"
              value={highImpact}
              sub={`${Math.round((highImpact / total) * 100)}% of signals`}
            />
            <KpiCard
              label="Clustered"
              value={clustered}
              sub={unclustered > 0 ? `${unclustered} unclustered` : 'All clustered ✓'}
            />
            <KpiCard
              label="Clusters"
              value={clusters?.length ?? 0}
              sub={
                (statusCounts['in_roadmap'] ?? 0) > 0
                  ? `${statusCounts['in_roadmap']} in roadmap`
                  : 'None in roadmap'
              }
            />
          </div>

          {/* Signal velocity — full width area chart */}
          <div className="card overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #E8E6E1' }}
            >
              <div>
                <p className="section-label mb-0.5">Signal velocity</p>
                <p className="text-xs text-grain-muted">Signals logged per week</p>
              </div>
              <span className="text-xs text-grain-muted">
                Last {velocityData.length} {velocityData.length === 1 ? 'week' : 'weeks'}
              </span>
            </div>
            <div className="px-4 pb-4 pt-4">
              {velocityData.length === 0 ? (
                <p className="text-xs text-grain-muted text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={velocityData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D97706" stopOpacity={0.14} />
                        <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E8E6E1" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: '#8C8984' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#8C8984' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#D97706"
                      strokeWidth={2}
                      fill="url(#amberGrad)"
                      dot={{ fill: '#D97706', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Source + Segment */}
          <div className="grid grid-cols-2 gap-4">
            {sourceData.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-5">By source</p>
                <div className="flex flex-col gap-4">
                  {sourceData.map(({ name, count }) => (
                    <ProgressRow key={name} label={name} count={count} max={maxSource} color="#D97706" />
                  ))}
                </div>
              </div>
            )}

            {segData.length > 0 && (
              <div className="card p-5">
                <p className="section-label mb-5">By segment</p>
                <div className="flex flex-col gap-4">
                  {segData.map(({ name, count }) => (
                    <ProgressRow key={name} label={name} count={count} max={maxSeg} color="#2563EB" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cluster status */}
          {statusData.length > 0 && (
            <div className="card p-5">
              <p className="section-label mb-5">Cluster status</p>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {statusData.map(({ status, name, count }) => (
                  <ProgressRow
                    key={status}
                    label={name}
                    count={count}
                    max={maxStatus}
                    color={STATUS_COLORS[status] ?? '#8C8984'}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-5 pt-5" style={{ borderTop: '1px solid #E8E6E1' }}>
                {statusData.map(({ status, name, count }) => (
                  <div
                    key={status}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-grain-border bg-grain-bg"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[status] ?? '#8C8984' }}
                    />
                    <span className="text-grain-muted">{name}</span>
                    <span className="font-semibold text-grain-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
