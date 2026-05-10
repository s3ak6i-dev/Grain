import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, List, BarChart2, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Logo from '@/components/ui/Logo'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/signals', label: 'Feedback', icon: List },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const { workspace } = useWorkspace()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const displayName = (user?.user_metadata?.full_name ?? user?.email ?? '') as string
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-screen"
      style={{
        background: '#0C0A08',
        /* Shadow replaces border — sidebar feels elevated above content */
        boxShadow: '4px 0 24px rgba(0,0,0,0.22), 1px 0 0 rgba(255,255,255,0.04)',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* Wordmark */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Logo variant="dark" size="md" />
        {workspace && (
          <div className="flex items-center gap-2 mt-2">
            {workspace.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="w-4 h-4 rounded object-contain"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            ) : (
              <div
                className="w-4 h-4 rounded flex items-center justify-center text-white shrink-0"
                style={{ background: 'rgba(255,255,255,0.14)', fontSize: 9, fontWeight: 700 }}
              >
                {workspace.name[0].toUpperCase()}
              </div>
            )}
            <p
              className="text-xs truncate"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {workspace.name}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
                isActive && 'sidebar-item-active',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  style={{ color: isActive ? '#D97706' : 'rgba(255,255,255,0.26)' }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: 'rgba(217,119,6,0.16)', color: '#D97706' }}
          >
            {initials || '?'}
          </div>
          <p
            className="text-xs font-medium truncate"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {user?.user_metadata?.full_name ?? user?.email}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="sidebar-sign-out mt-1 flex items-center gap-2 px-3 py-2 w-full rounded-lg text-xs"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
