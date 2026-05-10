import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { SignalValues } from '@/lib/schemas'
import type { Signal } from '@/lib/types'

export function useSignals() {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['signals', workspace?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('workspace_id', workspace!.id)
        .order('signal_date', { ascending: false })

      if (error) throw error
      return data as Signal[]
    },
    enabled: !!workspace?.id,
  })
}

export function useAssignCluster() {
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ signalId, clusterId }: { signalId: string; clusterId: string | null }) => {
      const { error } = await supabase
        .from('signals')
        .update({ cluster_id: clusterId })
        .eq('id', signalId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', workspace?.id] })
      queryClient.invalidateQueries({ queryKey: ['clusters', workspace?.id] })
      queryClient.invalidateQueries({ queryKey: ['signals-unclustered', workspace?.id] })
    },
  })
}

export function useLogSignal() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: SignalValues) => {
      const { error } = await supabase.from('signals').insert([{
        workspace_id: workspace!.id,
        problem_statement: values.problem_statement,
        verbatim_quote: values.verbatim_quote || null,
        source: values.source,
        segments: values.segments,
        business_impact: values.business_impact,
        cluster_id: values.cluster_id || null,
        signal_date: values.signal_date,
        logged_by: user!.id,
        account_name: values.account_name || null,
        account_mrr: values.account_mrr ?? null,
        source_url: values.source_url || null,
      }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', workspace?.id] })
      queryClient.invalidateQueries({ queryKey: ['clusters', workspace?.id] })
    },
  })
}

export interface BulkSignalItem {
  problem_statement: string
  cluster_id: string | null
}

export function useBulkLogSignals() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  return useMutation({
    mutationFn: async (items: BulkSignalItem[]) => {
      const rows = items.map((item) => ({
        workspace_id: workspace!.id,
        problem_statement: item.problem_statement,
        cluster_id: item.cluster_id,
        source: 'other' as const,
        segments: ['other'] as const,
        business_impact: 'medium' as const,
        signal_date: today,
        logged_by: user!.id,
        verbatim_quote: null,
        account_name: null,
        account_mrr: null,
        source_url: null,
      }))
      const { error } = await supabase.from('signals').insert(rows)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', workspace?.id] })
      queryClient.invalidateQueries({ queryKey: ['clusters', workspace?.id] })
      queryClient.invalidateQueries({ queryKey: ['signals-unclustered', workspace?.id] })
    },
  })
}
