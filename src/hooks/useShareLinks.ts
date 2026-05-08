import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { ShareLink } from '@/lib/types'

export function useShareLinks(clusterId: string) {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['share-links', clusterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('cluster_id', clusterId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ShareLink[]
    },
    enabled: !!clusterId && !!workspace?.id,
  })
}

export function useCreateShareLink() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clusterId: string) => {
      const { data, error } = await supabase
        .from('share_links')
        .insert([{
          cluster_id: clusterId,
          workspace_id: workspace!.id,
          created_by: user!.id,
        }])
        .select('token')
        .single()
      if (error) throw error
      return data.token as string
    },
    onSuccess: (_token, clusterId) => {
      queryClient.invalidateQueries({ queryKey: ['share-links', clusterId] })
    },
  })
}

export function useRevokeShareLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ linkId, clusterId: _clusterId }: { linkId: string; clusterId: string }) => {
      const { error } = await supabase
        .from('share_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', linkId)
      if (error) throw error
    },
    onSuccess: (_data, { clusterId }) => {
      queryClient.invalidateQueries({ queryKey: ['share-links', clusterId] })
    },
  })
}
