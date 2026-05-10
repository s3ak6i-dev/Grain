import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Trash2, Check } from 'lucide-react'
import { signalSchema, type SignalValues } from '@/lib/schemas'
import { useSignal, useUpdateSignal, useDeleteSignal } from '@/hooks/useSignals'
import { useClusters } from '@/hooks/useClusters'
import { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  IMPACT_LABELS,
  SEGMENT_LABELS,
  SOURCE_LABELS,
  type BusinessImpact,
  type SignalSource,
  type UserSegment,
} from '@/lib/types'

const SOURCES = Object.entries(SOURCE_LABELS) as [SignalSource, string][]
const SEGMENTS = Object.entries(SEGMENT_LABELS) as [UserSegment, string][]
const IMPACTS = Object.entries(IMPACT_LABELS) as [BusinessImpact, string][]

export default function SignalDetailPage() {
  const { signalId } = useParams<{ signalId: string }>()
  const navigate = useNavigate()
  const { data: signal, isLoading, error } = useSignal(signalId!)
  const { data: clusters } = useClusters()
  const updateSignal = useUpdateSignal()
  const deleteSignal = useDeleteSignal()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<SignalValues>({
    resolver: zodResolver(signalSchema),
  })

  useEffect(() => {
    if (!signal) return
    reset({
      problem_statement: signal.problem_statement,
      verbatim_quote: signal.verbatim_quote ?? '',
      source: signal.source,
      segments: signal.segments,
      business_impact: signal.business_impact,
      cluster_id: signal.cluster_id ?? undefined,
      signal_date: signal.signal_date,
      account_name: signal.account_name ?? '',
      account_mrr: signal.account_mrr ?? undefined,
      source_url: signal.source_url ?? '',
    })
  }, [signal, reset])

  async function onSubmit(values: SignalValues) {
    await updateSignal.mutateAsync({ signalId: signalId!, values })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    reset(values)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this signal? This cannot be undone.')) return
    await deleteSignal.mutateAsync(signalId!)
    navigate('/signals', { replace: true })
  }

  if (isLoading) return <div className="text-sm text-grain-muted py-8">Loading…</div>
  if (error || !signal) return <div className="text-sm text-red-500 py-8">Signal not found.</div>

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-grain-muted hover:text-grain-primary transition-colors mb-6"
      >
        <ArrowLeft size={13} />
        Back
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Edit feedback</h1>
          <p className="text-sm text-grain-muted mt-1">Logged {signal.signal_date}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteSignal.isPending}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors bg-white disabled:opacity-50 mt-1"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Textarea
          label="What's the underlying problem?"
          rows={4}
          error={errors.problem_statement?.message}
          hint="Describe the problem, not the solution they asked for"
          {...register('problem_statement')}
        />

        <Textarea
          label="What did they actually say? (optional)"
          placeholder='"I just need to get this into a spreadsheet somehow"'
          rows={2}
          {...register('verbatim_quote')}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Source</label>
            <select
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent transition-colors',
                errors.source ? 'border-red-400' : 'border-grain-border',
              )}
              {...register('source')}
            >
              {SOURCES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.source && <p className="text-xs text-red-500">{errors.source.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm rounded-md border border-grain-border bg-grain-surface text-grain-primary focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent transition-colors"
              {...register('signal_date')}
            />
          </div>
        </div>

        <Controller
          name="business_impact"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-grain-primary">Business impact</label>
              <div className="flex gap-2">
                {IMPACTS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors',
                      field.value === value
                        ? {
                            high: 'bg-red-50 text-red-700 border-red-300',
                            medium: 'bg-amber-50 text-amber-700 border-amber-300',
                            low: 'bg-grain-surface text-grain-primary border-grain-primary',
                          }[value]
                        : 'bg-grain-surface text-grain-muted border-grain-border hover:border-grain-muted',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        <Controller
          name="segments"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-grain-primary">User segment</label>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map(([value, label]) => {
                  const selected = field.value?.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((s) => s !== value)
                            : [...(field.value ?? []), value],
                        )
                      }
                      className={cn(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        selected
                          ? 'bg-grain-accent text-white border-grain-accent'
                          : 'bg-grain-surface text-grain-muted border-grain-border hover:border-grain-muted',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {errors.segments && <p className="text-xs text-red-500">{errors.segments.message}</p>}
            </div>
          )}
        />

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Account</label>
            <input
              placeholder="Acme Corp"
              className="w-full px-3 py-2 text-sm rounded-md border border-grain-border bg-grain-surface text-grain-primary placeholder:text-grain-muted focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent"
              {...register('account_name')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">MRR ($/mo)</label>
            <input
              type="number"
              min={0}
              placeholder="2500"
              className="w-full px-3 py-2 text-sm rounded-md border border-grain-border bg-grain-surface text-grain-primary placeholder:text-grain-muted focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent"
              {...register('account_mrr')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Source link</label>
            <input
              type="url"
              placeholder="https://…"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary placeholder:text-grain-muted focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
                errors.source_url ? 'border-red-400' : 'border-grain-border',
              )}
              {...register('source_url')}
            />
          </div>
        </div>
        {errors.source_url && <p className="text-xs text-red-500 -mt-3">{errors.source_url.message}</p>}

        {clusters && clusters.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">
              Problem <span className="text-grain-muted font-normal">(optional)</span>
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-md border border-grain-border bg-grain-surface text-grain-primary focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent transition-colors"
              {...register('cluster_id')}
            >
              <option value="">No problem</option>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {updateSignal.isError && (
          <p className="text-xs text-red-500">Failed to save. Please try again.</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1 border-t border-grain-border">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check size={12} />
              Saved
            </span>
          )}
          <Button type="submit" disabled={!isDirty} loading={updateSignal.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
