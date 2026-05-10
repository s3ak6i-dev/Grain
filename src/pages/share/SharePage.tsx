import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ImpactBadge, SegmentBadge, SourceBadge, StatusBadge } from '@/components/ui/Badge'
import { formatRelativeDate } from '@/lib/utils'
import type { ProblemCluster, Signal } from '@/lib/types'

interface ShareData {
  cluster: ProblemCluster
  signals: Signal[]
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: result, error } = await supabase.rpc('get_share_link_data', { link_token: token })
      if (error || !result) {
        setNotFound(true)
      } else {
        setData(result as ShareData)
      }
      setLoading(false)
    }
    load()
  }, [token])

  return (
    <div className="min-h-screen bg-grain-bg px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Wordmark */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-grain-accent font-semibold text-base tracking-tight">grain</span>
          <span className="text-xs text-grain-muted">Shared problem</span>
        </div>

        {loading && (
          <div className="bg-grain-surface border border-grain-border rounded-lg p-8 text-center">
            <p className="text-sm text-grain-muted">Loading…</p>
          </div>
        )}

        {notFound && (
          <div className="bg-grain-surface border border-grain-border rounded-lg p-8 text-center">
            <p className="text-sm font-medium text-grain-primary">Link not found</p>
            <p className="text-xs text-grain-muted mt-1">
              This share link is invalid or has been revoked.
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Cluster header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-grain-primary">{data.cluster.name}</h1>
                  <p className="text-sm text-grain-muted mt-1">{data.cluster.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-2xl font-semibold text-grain-accent">
                    {data.signals.length}
                  </span>
                  <span className="text-xs text-grain-muted">
                    feedback
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <StatusBadge status={data.cluster.status} />
              </div>
            </div>

            {/* Signals */}
            {data.signals.length > 0 ? (
              <div className="flex flex-col divide-y divide-grain-border border border-grain-border rounded-lg overflow-hidden">
                {data.signals.map((signal) => (
                  <div key={signal.id} className="bg-grain-bg px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-grain-primary leading-snug flex-1">
                        {signal.problem_statement}
                      </p>
                      <span className="text-xs text-grain-muted shrink-0 mt-0.5">
                        {formatRelativeDate(signal.signal_date)}
                      </span>
                    </div>
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
                    {signal.verbatim_quote && (
                      <p className="mt-2 text-xs text-grain-muted italic border-l-2 border-grain-border pl-3">
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
            ) : (
              <div className="bg-grain-surface border border-grain-border rounded-lg p-6 text-center">
                <p className="text-sm text-grain-muted">No feedback in this problem yet.</p>
              </div>
            )}

            <p className="text-xs text-grain-muted text-center mt-8">
              Shared via <span className="text-grain-accent">grain</span> · read-only view
            </p>
          </>
        )}
      </div>
    </div>
  )
}
