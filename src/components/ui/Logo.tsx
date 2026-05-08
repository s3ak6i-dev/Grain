interface LogoProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  className?: string
}

const SIZES = {
  sm: { icon: 13, fontSize: 13, gap: 6 },
  md: { icon: 16, fontSize: 15, gap: 7 },
  lg: { icon: 20, fontSize: 19, gap: 9 },
}

export default function Logo({ variant = 'light', size = 'md', iconOnly = false, className }: LogoProps) {
  const s = SIZES[size]
  const isDark = variant === 'dark'

  const bar2Color = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(24,22,15,0.22)'
  const bar3Color = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(24,22,15,0.11)'
  const wordmarkColor = isDark ? '#D97706' : '#18160F'

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, flexShrink: 0 }}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {/* Top bar — amber, full width */}
        <rect x="0" y="0" width="16" height="3.5" rx="1.75" fill="#D97706" />
        {/* Middle bar — 69% width, faded */}
        <rect x="0" y="6.25" width="11" height="3.5" rx="1.75" fill={bar2Color} />
        {/* Bottom bar — 44% width, more faded */}
        <rect x="0" y="12.5" width="7" height="3.5" rx="1.75" fill={bar3Color} />
      </svg>

      {!iconOnly && (
        <span
          style={{
            fontSize: s.fontSize,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: wordmarkColor,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          grain
        </span>
      )}
    </div>
  )
}
