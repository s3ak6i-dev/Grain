import { Link } from 'react-router-dom'
import { ChevronRight, Building2, Users } from 'lucide-react'
import { useWorkspace } from '@/contexts/WorkspaceContext'

export default function SettingsPage() {
  const { workspace, role } = useWorkspace()

  const rows = [
    { label: 'Name', value: workspace?.name, mono: false },
    { label: 'Slug', value: workspace?.slug, mono: true },
    { label: 'Your role', value: role ? role.charAt(0).toUpperCase() + role.slice(1) : '—', mono: false },
  ]

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-grain-muted mt-1">Manage your workspace configuration.</p>
      </div>

      {/* Workspace card */}
      <div className="card overflow-hidden mb-4">
        <div
          className="px-5 py-4 flex items-center gap-2.5"
          style={{ borderBottom: '1px solid #E8E6E1' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.14)' }}
          >
            <Building2 size={13} style={{ color: '#D97706' }} />
          </div>
          <p className="section-label">Workspace</p>
        </div>
        <div>
          {rows.map(({ label, value, mono }, i) => (
            <div
              key={label}
              className="flex justify-between items-center px-5 py-3.5 text-sm"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid #E8E6E1' : undefined }}
            >
              <span className="text-grain-muted">{label}</span>
              <span
                className={mono ? 'font-mono text-xs text-grain-primary' : 'font-medium text-grain-primary'}
              >
                {value ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team link */}
      {role === 'admin' && (
        <Link
          to="/settings/team"
          className="card card-interactive flex items-center justify-between px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.14)' }}
            >
              <Users size={13} style={{ color: '#D97706' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-grain-primary" style={{ letterSpacing: '-0.01em' }}>
                Team & Invites
              </p>
              <p className="text-xs text-grain-muted mt-0.5">Invite teammates and manage roles</p>
            </div>
          </div>
          <ChevronRight
            size={15}
            className="text-grain-muted group-hover:text-grain-primary transition-colors"
          />
        </Link>
      )}
    </div>
  )
}
