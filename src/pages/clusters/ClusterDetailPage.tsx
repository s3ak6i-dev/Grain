import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Share2, Copy, Check, Download, ExternalLink } from 'lucide-react'
import {
  useCluster,
  useClusterSignals,
  useUpdateClusterStatus,
  useArchiveCluster,
  useOpenQuestions,
  useAddOpenQuestion,
  useDeleteOpenQuestion,
} from '@/hooks/useClusters'
import { useShareLinks, useCreateShareLink, useRevokeShareLink } from '@/hooks/useShareLinks'
import { ImpactBadge, SegmentBadge, SourceBadge, StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatRelativeDate } from '@/lib/utils'
import {
  SEGMENT_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  type ClusterStatus,
  type SignalSource,
  type UserSegment,
} from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { openQuestionSchema, type OpenQuestionValues } from '@/lib/schemas'
import type { Signal, ProblemCluster } from '@/lib/types'

const STATUS_OPTIONS: ClusterStatus[] = ['watching', 'investigating', 'in_roadmap', 'wont_solve']

function SegmentBreakdown({ segments }: { segments: string[] }) {
  if (segments.length === 0) return null

  const counts: Record<string, number> = {}
  segments.forEach((seg) => { counts[seg] = (counts[seg] ?? 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = sorted[0][1]

  return (
    <div className="flex flex-col gap-2">
      {sorted.map(([seg, count]) => (
        <div key={seg} className="flex items-center gap-3">
          <span className="text-xs text-grain-muted w-24 shrink-0">
            {SEGMENT_LABELS[seg as UserSegment] ?? seg}
          </span>
          <div className="flex-1 bg-grain-border rounded-full h-1.5">
            <div
              className="bg-grain-accent h-1.5 rounded-full"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-grain-primary w-4 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}

function SourceBreakdown({ sources }: { sources: string[] }) {
  if (sources.length === 0) return null

  const counts: Record<string, number> = {}
  sources.forEach((src) => { counts[src] = (counts[src] ?? 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(([src, count]) => (
        <div
          key={src}
          className="flex items-center gap-1.5 px-2 py-1 bg-grain-surface border border-grain-border rounded text-xs"
        >
          <span className="text-grain-muted">{SOURCE_LABELS[src as SignalSource] ?? src}</span>
          <span className="font-semibold text-grain-primary">{count}</span>
        </div>
      ))}
    </div>
  )
}

function OpenQuestions({ clusterId }: { clusterId: string }) {
  const { data: questions } = useOpenQuestions(clusterId)
  const addQuestion = useAddOpenQuestion(clusterId)
  const deleteQuestion = useDeleteOpenQuestion(clusterId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OpenQuestionValues>({
    resolver: zodResolver(openQuestionSchema),
  })

  async function onSubmit(values: OpenQuestionValues) {
    await addQuestion.mutateAsync(values)
    reset()
  }

  return (
    <div>
      <h2 className="text-xs font-semibold text-grain-muted uppercase tracking-wide mb-3">
        Open questions
      </h2>

      {questions && questions.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex items-start justify-between gap-3 px-3 py-2 bg-grain-surface border border-grain-border rounded-md"
            >
              <span className="text-sm text-grain-primary">{q.question}</span>
              <button
                onClick={() => deleteQuestion.mutate(q.id)}
                className="text-grain-muted hover:text-red-500 transition-colors shrink-0 mt-0.5"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <input
          placeholder="Add an open question…"
          className={cn(
            'flex-1 px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
            'placeholder:text-grain-muted border-grain-border',
            'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
            errors.question ? 'border-red-400' : '',
          )}
          {...register('question')}
        />
        <Button type="submit" size="sm" variant="secondary" loading={addQuestion.isPending}>
          Add
        </Button>
      </form>
    </div>
  )
}

// ─── Share panel ─────────────────────────────────────────────────────────────

function SharePanel({ clusterId }: { clusterId: string }) {
  const { data: links } = useShareLinks(clusterId)
  const createLink = useCreateShareLink()
  const revokeLink = useRevokeShareLink()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(token: string, id: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-grain-muted uppercase tracking-wide">
          Share links
        </h2>
        <Button
          size="sm"
          variant="secondary"
          loading={createLink.isPending}
          onClick={() => createLink.mutate(clusterId)}
        >
          <Share2 size={12} className="mr-1.5" />
          New link
        </Button>
      </div>

      {(!links || links.length === 0) && (
        <p className="text-xs text-grain-muted">
          Generate a public read-only link to share this problem with stakeholders.
        </p>
      )}

      {links && links.length > 0 && (
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 px-3 py-2 bg-grain-bg border border-grain-border rounded-md"
            >
              <span className="flex-1 text-xs text-grain-muted font-mono truncate">
                /share/{link.token.slice(0, 12)}…
              </span>
              <a
                href={`/share/${link.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grain-muted hover:text-grain-accent transition-colors"
              >
                <ExternalLink size={12} />
              </a>
              <button
                onClick={() => handleCopy(link.token, link.id)}
                className="text-grain-muted hover:text-grain-primary transition-colors"
              >
                {copiedId === link.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              </button>
              <button
                onClick={() => revokeLink.mutate({ linkId: link.id, clusterId })}
                className="text-grain-muted hover:text-red-500 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportBrief(cluster: ProblemCluster, signals: Signal[]) {
  const lines: string[] = []
  lines.push(`PROBLEM BRIEF — ${cluster.name}`)
  lines.push('='.repeat(60))
  lines.push('')
  lines.push(`Status: ${STATUS_LABELS[cluster.status]}`)
  lines.push(`Feedback: ${signals.length}`)
  lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
  lines.push('')
  lines.push('DESCRIPTION')
  lines.push('-'.repeat(40))
  lines.push(cluster.description)
  lines.push('')
  lines.push('FEEDBACK')
  lines.push('-'.repeat(40))

  signals.forEach((s, i) => {
    lines.push('')
    lines.push(`${i + 1}. ${s.problem_statement}`)
    if (s.account_name) {
      lines.push(`   Account: ${s.account_name}${s.account_mrr != null ? ` ($${s.account_mrr.toLocaleString()}/mo)` : ''}`)
    }
    lines.push(`   Source: ${SOURCE_LABELS[s.source]} · Impact: ${s.business_impact} · Date: ${s.signal_date}`)
    if (s.verbatim_quote) lines.push(`   "${s.verbatim_quote}"`)
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${cluster.name.toLowerCase().replace(/\s+/g, '-')}-brief.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'signals' | 'questions' | 'share'

export default function ClusterDetailPage() {
  const { clusterId } = useParams<{ clusterId: string }>()
  const navigate = useNavigate()
  const { data: cluster, isLoading } = useCluster(clusterId!)
  const { data: signals } = useClusterSignals(clusterId!)
  const updateStatus = useUpdateClusterStatus()
  const archiveCluster = useArchiveCluster()
  const [editingStatus, setEditingStatus] = useState(false)
  const [tab, setTab] = useState<Tab>('signals')

  const allSegments = signals?.flatMap((s) => s.segments) ?? []
  const allSources = signals?.map((s) => s.source) ?? []

  if (isLoading) return <div className="text-sm text-grain-muted p-6">Loading…</div>
  if (!cluster) return <div className="text-sm text-red-500 p-6">Problem not found.</div>

  const tabs: { id: Tab; label: string }[] = [
    { id: 'signals', label: `Feedback${signals?.length ? ` (${signals.length})` : ''}` },
    { id: 'questions', label: 'Open Questions' },
    { id: 'share', label: 'Share' },
  ]

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs text-grain-muted hover:text-grain-primary transition-colors mb-6"
      >
        <ArrowLeft size={13} />
        Dashboard
      </button>

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="page-title">{cluster.name}</h1>
            <p className="text-sm text-grain-muted mt-1.5 leading-relaxed">{cluster.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 mt-0.5">
            <button
              onClick={async () => {
                if (!window.confirm('Archive this problem? It will be hidden from the dashboard but all feedback is preserved.')) return
                await archiveCluster.mutateAsync(cluster.id)
                navigate('/dashboard')
              }}
              disabled={archiveCluster.isPending}
              className="flex items-center gap-1.5 text-xs text-grain-muted hover:text-red-500 border border-grain-border rounded-lg px-3 py-1.5 transition-colors bg-white disabled:opacity-50"
            >
              Archive
            </button>
            {signals && signals.length > 0 && (
              <button
                onClick={() => exportBrief(cluster, signals)}
                className="flex items-center gap-1.5 text-xs text-grain-muted hover:text-grain-primary border border-grain-border rounded-lg px-3 py-1.5 transition-colors bg-white shadow-sm"
              >
                <Download size={12} />
                Export brief
              </button>
            )}
            <div className="text-right">
              <span
                className="font-bold leading-none tabular-nums text-grain-accent"
                style={{ fontSize: 36, letterSpacing: '-0.02em' }}
              >
                {signals?.length ?? 0}
              </span>
              <p className="text-xs text-grain-muted mt-0.5">
                feedback
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-2">
          {editingStatus ? (
            <select
              autoFocus
              defaultValue={cluster.status}
              onBlur={() => setEditingStatus(false)}
              onChange={(e) => {
                updateStatus.mutate({ clusterId: cluster.id, status: e.target.value as ClusterStatus })
                setEditingStatus(false)
              }}
              className="text-xs px-2 py-1 rounded-md border border-grain-border bg-grain-surface text-grain-primary focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingStatus(true)}
              title="Click to change status"
              className="transition-opacity hover:opacity-75"
            >
              <StatusBadge status={cluster.status} />
            </button>
          )}
          <span className="text-xs text-grain-muted">Click to change</span>
        </div>
      </div>

      {/* Breakdown (always visible when signals exist) */}
      {signals && signals.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-5">
            <p className="section-label mb-4">By segment</p>
            <SegmentBreakdown segments={allSegments} />
          </div>
          <div className="card p-5">
            <p className="section-label mb-4">By source</p>
            <SourceBreakdown sources={allSources} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-0.5 p-1 rounded-xl mb-6"
        style={{ background: '#F7F6F3', border: '1px solid #E8E6E1' }}
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
              tab === id
                ? 'bg-grain-bg text-grain-primary shadow-sm border border-grain-border'
                : 'text-grain-muted hover:text-grain-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Signals */}
      {tab === 'signals' && (
        <div>
          {!signals?.length && (
            <div className="card p-10 text-center">
              <p className="text-sm font-semibold text-grain-primary">No feedback yet</p>
              <p className="text-xs text-grain-muted mt-1.5">
                Go to the Feedback page and assign feedback here using the problem dropdown.
              </p>
            </div>
          )}

          {signals && signals.length > 0 && (
            <div className="card overflow-hidden divide-y divide-grain-border">
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  onClick={() => navigate(`/signals/${signal.id}`)}
                  className={cn(
                    'signal-row px-5 py-4 bg-white cursor-pointer hover:bg-grain-surface/60 transition-colors',
                    signal.business_impact === 'high' && 'signal-row-high',
                    signal.business_impact === 'medium' && 'signal-row-medium',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-grain-primary leading-snug" style={{ letterSpacing: '-0.005em' }}>
                        {signal.problem_statement}
                      </p>
                      {signal.account_name && (
                        <p className="text-xs text-grain-muted mt-0.5">
                          {signal.account_name}
                          {signal.account_mrr != null && (
                            <span className="ml-1.5 font-medium text-grain-primary">
                              ${signal.account_mrr.toLocaleString()}/mo
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {signal.source_url && (
                        <a
                          href={signal.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-grain-muted hover:text-grain-accent transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                      <span className="text-xs text-grain-muted">
                        {formatRelativeDate(signal.signal_date)}
                      </span>
                    </div>
                  </div>
                  {signal.verbatim_quote && (
                    <p className="mt-2 text-xs text-grain-muted italic pl-3" style={{ borderLeft: '2px solid #E8E6E1' }}>
                      "{signal.verbatim_quote}"
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <SourceBadge source={signal.source} />
                    <ImpactBadge impact={signal.business_impact} />
                    {signal.segments.map((seg) => (
                      <SegmentBadge key={seg} segment={seg} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Open Questions */}
      {tab === 'questions' && (
        <div className="card p-5">
          <OpenQuestions clusterId={cluster.id} />
        </div>
      )}

      {/* Tab: Share */}
      {tab === 'share' && (
        <div className="card p-5">
          <SharePanel clusterId={cluster.id} />
        </div>
      )}
    </div>
  )
}
