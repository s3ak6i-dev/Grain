import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { InviteValues } from '@/lib/schemas'
import type { Invite, WorkspaceMember } from '@/lib/types'

export interface MemberWithEmail extends WorkspaceMember {
  email: string
  full_name: string | null
}

export function useTeamMembers() {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['team-members', workspace?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace!.id)
        .order('created_at', { ascending: true })
      if (error) throw error

      // Fetch email + name from auth.users via Supabase admin isn't possible on the client.
      // We store display_name in workspace_members; for email we rely on what was stored.
      return data as WorkspaceMember[]
    },
    enabled: !!workspace?.id,
  })
}

export function useInvites() {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['invites', workspace?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('workspace_id', workspace!.id)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Invite[]
    },
    enabled: !!workspace?.id,
  })
}

export function useCreateInvite() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: InviteValues) => {
      const { data, error } = await supabase
        .from('invites')
        .insert([{
          workspace_id: workspace!.id,
          email: values.email,
          role: values.role,
          invited_by: user!.id,
        }])
        .select('token')
        .single()
      if (error) throw error
      return data.token as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', workspace?.id] })
    },
  })
}

export function useRevokeInvite() {
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invites')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', inviteId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', workspace?.id] })
    },
  })
}

export function useUpdateMemberColor() {
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, color, displayName }: { memberId: string; color: string; displayName?: string }) => {
      const update: Partial<WorkspaceMember> = { avatar_color: color }
      if (displayName !== undefined) update.display_name = displayName
      const { error } = await supabase
        .from('workspace_members')
        .update(update)
        .eq('id', memberId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', workspace?.id] })
    },
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc('accept_invite', { invite_token: token })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })
}
