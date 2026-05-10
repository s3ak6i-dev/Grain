import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClusters } from '@/hooks/useClusters'
import { useBulkLogSignals } from '@/hooks/useSignals'
import type { BulkSignalItem } from '@/hooks/useSignals'
import { ArrowLeft, Upload, X, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'

// ─── Parsing ──────────────────────────────────────────────────────────────────

function parsePlaintext(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 5)
}

function parseCSV(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => {
      line = line.trim()
      if (!line) return ''
      if (line.startsWith('"')) {
        const match = line.match(/^"((?:[^"\\]|\\.|"")*)"/)
        return match ? match[1].replace(/""/g, '"').trim() : line.split(',')[0].trim()
      }
      return line.split(',')[0].trim()
    })
    .filter((s) => s.length > 5)
}

function parseXLSX(buffer: ArrayBuffer): string[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
  return rows
    .map((row) => String(row[0] ?? '').trim())
    .filter((s) => s.length > 5)
}

// ─── Step 1: Paste ────────────────────────────────────────────────────────────

function PasteStep({ onContinue }: { onContinue: (items: string[]) => void }) {
  const [tab, setTab] = useState<'text' | 'csv'>('text')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleContinue() {
    const parsed = tab === 'text' ? parsePlaintext(text) : parseCSV(text)
    if (parsed.length === 0) {
      setError('No feedback found. Make sure each piece of feedback is on its own line.')
      return
    }
    onContinue(parsed)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    if (isXLSX) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const parsed = parseXLSX(ev.target?.result as ArrayBuffer)
        setText(parsed.join('\n'))
      }
      reader.readAsArrayBuffer(file)
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => setText(ev.target?.result as string)
      reader.readAsText(file)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="page-title">Import feedback</h1>
        <p className="text-sm text-grain-muted mt-1">
          Paste your feedback below — one piece per line. You'll assign clusters on the next step.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-grain-surface rounded-lg w-fit">
        {(['text', 'csv'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setText(''); setError('') }}
            className={cn(
              'px-4 py-1.5 text-xs font-medium rounded-md transition-colors',
              tab === t
                ? 'bg-white text-grain-primary shadow-sm'
                : 'text-grain-muted hover:text-grain-primary'
            )}
          >
            {t === 'text' ? 'Paste text' : 'Upload CSV'}
          </button>
        ))}
      </div>

      {tab === 'text' && (
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError('') }}
          placeholder={"Merchants can't tell why their payments are declining\nOnboarding takes too long for enterprise accounts\nNo way to export data for board reporting"}
          rows={12}
          className="w-full px-4 py-3 text-sm text-grain-primary bg-white border border-grain-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-grain-accent/25 focus:border-grain-accent placeholder:text-grain-muted/60 leading-relaxed"
        />
      )}

      {tab === 'csv' && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-grain-border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-grain-accent/50 hover:bg-grain-surface transition-colors"
          >
            <Upload size={20} className="text-grain-muted" />
            <div className="text-center">
              <p className="text-sm font-medium text-grain-primary">Click to upload a CSV</p>
              <p className="text-xs text-grain-muted mt-0.5">CSV or Excel — we'll use the first column as the feedback</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" className="hidden" onChange={handleFile} />
          </div>
          {text && (
            <div className="mt-3 px-3 py-2 bg-grain-surface rounded-lg flex items-center justify-between">
              <p className="text-xs text-grain-muted">File loaded — {parseCSV(text).length} rows detected</p>
              <button onClick={() => setText('')} className="text-grain-muted hover:text-grain-primary">
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-grain-muted">
          {text
            ? `${(tab === 'text' ? parsePlaintext : parseCSV)(text).length} pieces of feedback detected`
            : 'Nothing pasted yet'}
        </p>
        <Button onClick={handleContinue} disabled={!text.trim()}>
          Continue →
        </Button>
      </div>
    </div>
  )
}

// ─── Step 2: Review ───────────────────────────────────────────────────────────

interface ReviewItem {
  id: number
  text: string
  clusterId: string | null
  dismissed: boolean
}

function ReviewCard({
  item,
  clusters,
  onUpdate,
  onDismiss,
}: {
  item: ReviewItem
  clusters: { id: string; name: string }[]
  onUpdate: (id: number, patch: Partial<ReviewItem>) => void
  onDismiss: (id: number) => void
}) {
  return (
    <div className="card p-4 flex gap-3">
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <textarea
          value={item.text}
          onChange={(e) => onUpdate(item.id, { text: e.target.value })}
          rows={2}
          className="w-full text-sm text-grain-primary bg-grain-bg border border-grain-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-grain-accent/25 focus:border-grain-accent leading-relaxed"
        />
        <select
          value={item.clusterId ?? ''}
          onChange={(e) => onUpdate(item.id, { clusterId: e.target.value || null })}
          className="text-xs px-2.5 py-1.5 rounded-lg border bg-white text-grain-muted border-grain-border focus:outline-none focus:ring-1 focus:ring-grain-accent/30 focus:border-grain-accent w-fit"
          style={{ color: item.clusterId ? '#18160F' : undefined, fontWeight: item.clusterId ? 500 : 400 }}
        >
          <option value="">Add to problem…</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        className="shrink-0 mt-0.5 text-grain-muted hover:text-red-400 transition-colors"
        title="Remove"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function ReviewStep({
  raw,
  onBack,
  onDone,
}: {
  raw: string[]
  onBack: () => void
  onDone: (count: number) => void
}) {
  const { data: clusters = [] } = useClusters()
  const bulk = useBulkLogSignals()

  const [items, setItems] = useState<ReviewItem[]>(() =>
    raw.map((text, i) => ({ id: i, text, clusterId: null, dismissed: false }))
  )

  const visible = items.filter((i) => !i.dismissed)

  function update(id: number, patch: Partial<ReviewItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function dismiss(id: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i)))
  }

  async function handleLog() {
    const payload: BulkSignalItem[] = visible
      .filter((i) => i.text.trim().length > 0)
      .map((i) => ({ problem_statement: i.text.trim(), cluster_id: i.clusterId }))

    await bulk.mutateAsync(payload)
    onDone(payload.length)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="page-title">Review feedback</h1>
          <p className="text-sm text-grain-muted mt-1">
            Edit any item, assign a problem cluster, or remove ones you don't need.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-grain-muted hover:text-grain-primary transition-colors mt-1"
        >
          <ArrowLeft size={12} />
          Back
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-grain-muted">All items removed. Go back to paste more.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              clusters={clusters}
              onUpdate={update}
              onDismiss={dismiss}
            />
          ))}
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-grain-muted">{visible.length} signal{visible.length !== 1 ? 's' : ''} to log</p>
          <Button onClick={handleLog} disabled={bulk.isPending}>
            {bulk.isPending ? 'Logging…' : `Log ${visible.length} signal${visible.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}

      {bulk.isError && (
        <p className="mt-3 text-xs text-red-500 text-right">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}

// ─── Step 3: Done ─────────────────────────────────────────────────────────────

function DoneStep({ count, onImportMore }: { count: number; onImportMore: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="flex justify-center mb-4">
        <CheckCircle2 size={40} className="text-grain-accent" />
      </div>
      <h2 className="text-xl font-semibold text-grain-primary" style={{ letterSpacing: '-0.02em' }}>
        {count} signal{count !== 1 ? 's' : ''} logged
      </h2>
      <p className="text-sm text-grain-muted mt-2 mb-8">
        Open any signal to add source, impact, and segment details.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={() => navigate('/signals')}>View signals</Button>
        <button
          onClick={onImportMore}
          className="text-sm text-grain-muted hover:text-grain-primary transition-colors"
        >
          Import more
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Step = 'paste' | 'review' | 'done'

export default function ImportPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('paste')
  const [raw, setRaw] = useState<string[]>([])
  const [loggedCount, setLoggedCount] = useState(0)

  function reset() {
    setStep('paste')
    setRaw([])
    setLoggedCount(0)
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {(['paste', 'review', 'done'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold',
              step === s
                ? 'bg-grain-accent text-white'
                : i < ['paste', 'review', 'done'].indexOf(step)
                  ? 'bg-grain-accent/20 text-grain-accent'
                  : 'bg-grain-border text-grain-muted'
            )}>
              {i + 1}
            </div>
            <span className={cn(
              'text-xs font-medium capitalize',
              step === s ? 'text-grain-primary' : 'text-grain-muted'
            )}>
              {s}
            </span>
            {i < 2 && <div className="w-8 h-px bg-grain-border mx-1" />}
          </div>
        ))}

        <button
          onClick={() => navigate('/signals')}
          className="ml-auto flex items-center gap-1.5 text-xs text-grain-muted hover:text-grain-primary transition-colors"
        >
          <X size={12} />
          Cancel
        </button>
      </div>

      {step === 'paste' && (
        <PasteStep
          onContinue={(items) => {
            setRaw(items)
            setStep('review')
          }}
        />
      )}

      {step === 'review' && (
        <ReviewStep
          raw={raw}
          onBack={() => setStep('paste')}
          onDone={(count) => {
            setLoggedCount(count)
            setStep('done')
          }}
        />
      )}

      {step === 'done' && (
        <DoneStep count={loggedCount} onImportMore={reset} />
      )}
    </div>
  )
}
