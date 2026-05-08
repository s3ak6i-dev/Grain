import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all rounded-lg cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-grain-accent text-white hover:bg-grain-accent-hover btn-amber': variant === 'primary',
          'bg-grain-surface text-grain-primary border border-grain-border hover:bg-grain-bg hover:border-grain-muted/30 shadow-sm':
            variant === 'secondary',
          'text-grain-muted hover:text-grain-primary hover:bg-grain-bg': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-2.5 text-sm': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {loading ? <span className="opacity-60">Loading…</span> : children}
    </button>
  )
}
