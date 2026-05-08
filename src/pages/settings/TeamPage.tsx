import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { inviteSchema, type InviteValues } from '@/lib/schemas'
import { useTeamMembers, useInvites, useCreateInvite, useRevokeInvite, useUpdateMemberColor } from '@/hooks/useTeam'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { WorkspaceMember } from '@/lib/types'

const AVATAR_COLORS = [
  '#D97706', '#16A34A', '#9333EA', '#2563EB',
  '#E11D48', '#0891B2', '#EA580C', '#64748B',
]

function Avatar({ color, name, size = 'md' }: { color: string; name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm',
      )}
      style={{ backgroundColor: color }}
    >
      {initials || '?'}
    </div>
  )
}

function MemberRow({ member, isCurrentUser }: { member: WorkspaceMember; isCurrentUser: boolean }) {
  const [editing, setEditing] = useState(false)
  const updateColor = useUpdateMemberColor()
  const { user } = useAuth()
  const displayName =
    member.display_name ?? (isCurrentUser ? user?.user_metadata?.full_name : null) ?? 'Team member'

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5"
      style={{ borderBottom: '1px solid #E8E6E1' }}
    >
      <div className="relative">
        <Avatar color={member.avatar_color} name={displayName} />
        {isCurrentUser && (
          <button
            onClick={() => setEditing((e) => !e)}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-grain-border rounded-full text-[9px] flex items-center justify-center text-grain-muted hover:text-grain-primary transition-colors shadow-sm"
            title="Change color"
          >
            ●
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-grain-primary truncate" style={{ letterSpacing: '-0.005em' }}>
          {displayName}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs text-grain-muted font-normal">(you)</span>
          )}
        </p>
        <p className="text-xs text-grain-muted capitalize">{member.role}</p>
      </div>

      {editing && isCurrentUser && (
        <div className="flex gap-1.5">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                updateColor.mutate({ memberId: member.id, color: c })
                setEditing(false)
              }}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                member.avatar_color === c ? 'border-grain-primary' : 'border-transparent',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InviteRow({ invite }: { invite: { id: string; email: string; role: string; token: string } }) {
  const [copied, setCopied] = useState(false)
  const revoke = useRevokeInvite()
  const link = `${window.location.origin}/invite/${invite.token}`

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5"
      style={{ borderBottom: '1px solid #E8E6E1' }}
    >
      <div className="w-9 h-9 rounded-full bg-grain-bg border border-grain-border flex items-center justify-center shrink-0">
        <span className="text-xs text-grain-muted">?</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-grain-primary truncate">{invite.email}</p>
        <p className="text-xs text-grain-muted capitalize">{invite.role} · Invite pending</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-grain-muted hover:text-grain-primary transition-colors px-2.5 py-1.5 border border-grain-border rounded-lg bg-grain-bg hover:bg-white"
      >
        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button
        onClick={() => revoke.mutate(invite.id)}
        className="text-grain-muted hover:text-red-500 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function TeamPage() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const { data: members } = useTeamMembers()
  const { data: pendingInvites } = useInvites()
  const createInvite = useCreateInvite()

  const [newToken, setNewToken] = useState<string | null>(null)
  const [copiedNew, setCopiedNew] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'contributor' },
  })

  async function onSubmit(values: InviteValues) {
    const token = await createInvite.mutateAsync(values)
    setNewToken(token)
    reset()
  }

  async function copyNewLink() {
    if (!newToken) return
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${newToken}`)
    setCopiedNew(true)
    setTimeout(() => setCopiedNew(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="page-title">Team & Invites</h1>
        <p className="text-sm text-grain-muted mt-1">Invite teammates so they can log signals too.</p>
      </div>

      {/* Members */}
      <div className="card overflow-hidden mb-4">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #E8E6E1' }}>
          <p className="section-label">
            {workspace?.name} · {members?.length ?? 0}{' '}
            {members?.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <div>
          {members?.map((m) => (
            <MemberRow key={m.id} member={m} isCurrentUser={m.user_id === user?.id} />
          ))}
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #E8E6E1' }}>
            <p className="section-label">Pending invites</p>
          </div>
          <div>
            {pendingInvites.map((inv) => (
              <InviteRow key={inv.id} invite={inv} />
            ))}
          </div>
        </div>
      )}

      {/* New invite banner */}
      {newToken && (
        <div
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-800">Invite link created</p>
            <p className="text-xs text-emerald-700 truncate font-mono mt-0.5">
              {window.location.origin}/invite/{newToken}
            </p>
          </div>
          <button
            onClick={copyNewLink}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 px-2.5 py-1.5 border border-emerald-300 rounded-lg shrink-0 bg-white/50"
          >
            {copiedNew ? <Check size={12} /> : <Copy size={12} />}
            {copiedNew ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setNewToken(null)} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Invite form */}
      <div className="card p-5">
        <p className="section-label mb-4">Invite a teammate</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder="colleague@company.com"
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-grain-bg text-grain-primary',
                  'placeholder:text-grain-muted',
                  'focus:outline-none focus:ring-2 focus:ring-grain-accent/25 focus:border-grain-accent',
                  errors.email ? 'border-red-300' : 'border-grain-border',
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <select
              className="px-2.5 py-2 text-sm rounded-lg border bg-grain-bg text-grain-primary border-grain-border focus:outline-none focus:ring-2 focus:ring-grain-accent/25"
              {...register('role')}
            >
              <option value="contributor">Contributor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" size="sm" loading={createInvite.isPending}>
            Generate invite link
          </Button>

          {createInvite.isError && (
            <p className="text-xs text-red-500">
              {(createInvite.error as any)?.message ?? 'Failed to create invite'}
            </p>
          )}
        </form>

        <p className="text-xs text-grain-muted mt-4 leading-relaxed">
          Invite links are valid until revoked. Anyone with the link can join your workspace.
        </p>
      </div>
    </div>
  )
}
