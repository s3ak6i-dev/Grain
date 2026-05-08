import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-grain-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
          'placeholder:text-grain-muted',
          'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
          'transition-colors',
          error ? 'border-red-400' : 'border-grain-border',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-grain-muted">{hint}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-grain-primary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-md border bg-grain-surface text-grain-primary',
          'placeholder:text-grain-muted resize-none',
          'focus:outline-none focus:ring-2 focus:ring-grain-accent/30 focus:border-grain-accent',
          'transition-colors',
          error ? 'border-red-400' : 'border-grain-border',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-grain-muted">{hint}</p>}
    </div>
  )
}
