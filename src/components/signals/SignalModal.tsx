import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { signalSchema, type SignalValues } from '@/lib/schemas'
import {
  IMPACT_LABELS,
  SEGMENT_LABELS,
  SOURCE_LABELS,
  type BusinessImpact,
  type SignalSource,
  type UserSegment,
} from '@/lib/types'
import { useLogSignal } from '@/hooks/useSignals'
import { useClusters } from '@/hooks/useClusters'

const SOURCES = Object.entries(SOURCE_LABELS) as [SignalSource, string][]
const SEGMENTS = Object.entries(SEGMENT_LABELS) as [UserSegment, string][]
const IMPACTS = Object.entries(IMPACT_LABELS) as [BusinessImpact, string][]

const today = new Date().toISOString().split('T')[0]

interface SignalModalProps {
  open: boolean
  onClose: () => void
}

export default function SignalModal({ open, onClose }: SignalModalProps) {
  const logSignal = useLogSignal()
  const { data: clusters } = useClusters()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SignalValues>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      signal_date: today,
      segments: [],
      business_impact: 'medium',
    },
  })

  async function onSubmit(values: SignalValues) {
    await logSignal.mutateAsync(values)
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log a signal">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Problem statement */}
        <Textarea
          label="What's the underlying problem?"
          placeholder="Users can't export their data to share with their team"
          rows={3}
          error={errors.problem_statement?.message}
          hint="Describe the problem, not the solution they asked for"
          {...register('problem_statement')}
        />

        {/* Verbatim quote */}
        <Textarea
          label="What did they actually say? (optional)"
          placeholder='"I just need to get this into a spreadsheet somehow"'
          rows={2}
          {...register('verbatim_quote')}
        />

        {/* Source + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Source</label>
            <select
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
                'transition-colors',
                errors.source ? 'border-red-400' : 'border-grain-border',
              )}
              {...register('source')}
            >
              <option value="">Select source…</option>
              {SOURCES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.source && <p className="text-xs text-red-500">{errors.source.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Signal date</label>
            <input
              type="date"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
                'transition-colors border-grain-border',
              )}
              {...register('signal_date')}
            />
          </div>
        </div>

        {/* Business impact */}
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

        {/* Segments */}
        <Controller
          name="segments"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-grain-primary">User segment</label>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map(([value, label]) => {
                  const selected = field.value.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((s) => s !== value)
                            : [...field.value, value],
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
              {errors.segments && (
                <p className="text-xs text-red-500">{errors.segments.message}</p>
              )}
            </div>
          )}
        />

        {/* Account info + source URL */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Account</label>
            <input
              placeholder="Acme Corp"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'placeholder:text-grain-muted border-grain-border',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
              )}
              {...register('account_name')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">MRR ($/mo)</label>
            <input
              type="number"
              min={0}
              placeholder="2500"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'placeholder:text-grain-muted border-grain-border',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
              )}
              {...register('account_mrr')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">Source link</label>
            <input
              type="url"
              placeholder="https://…"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'placeholder:text-grain-muted',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
                errors.source_url ? 'border-red-400' : 'border-grain-border',
              )}
              {...register('source_url')}
            />
          </div>
        </div>
        {errors.source_url && (
          <p className="text-xs text-red-500 -mt-2">{errors.source_url.message}</p>
        )}

        {/* Cluster (optional) */}
        {clusters && clusters.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-grain-primary">
              Problem cluster <span className="text-grain-muted font-normal">(optional)</span>
            </label>
            <select
              className={cn(
                'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
                'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
                'transition-colors border-grain-border',
              )}
              {...register('cluster_id')}
            >
              <option value="">Leave unclustered</option>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {logSignal.isError && (
          <p className="text-xs text-red-500">
            {logSignal.error instanceof Error ? logSignal.error.message : 'Failed to log signal'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1 border-t border-grain-border">
          <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={logSignal.isPending}>
            Log signal
          </Button>
        </div>
      </form>
    </Modal>
  )
}
