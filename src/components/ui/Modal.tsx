import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(24,22,15,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4 rounded-2xl',
          className,
        )}
        style={{
          background: '#FFFFFF',
          boxShadow:
            '0 8px 32px rgba(24,22,15,0.14), 0 32px 72px rgba(24,22,15,0.12), 0 0 0 1px rgba(24,22,15,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #E8E6E1' }}
        >
          <h2 className="text-sm font-semibold text-grain-primary" style={{ letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-grain-muted hover:text-grain-primary hover:bg-grain-bg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}
