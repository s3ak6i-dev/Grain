import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { ClusterValues, OpenQuestionValues } from '@/lib/schemas'
import type { ClusterStatus, OpenQuestion, ProblemCluster, Signal } from '@/lib/types'

export interface ClusterWithCount extends ProblemCluster {
  signal_count: number
  last_signal_date: string | null
}

export function useClusters() {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['clusters', workspace?.id],
    queryFn: async () => {
      const { data: clusters, error } = await supabase
        .from('problem_clusters')
        .select('*')
        .eq('workspace_id', workspace!.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch signal counts per cluster in one query
      const { data: counts, error: countError } = await supabase
        .from('signals')
        .select('cluster_id, signal_date')
        .eq('workspace_id', workspace!.id)
        .not('cluster_id', 'is', null)

      if (countError) throw countError

      return (clusters as ProblemCluster[]).map((cluster) => {
        const clusterSignals = counts?.filter((s) => s.cluster_id === cluster.id) ?? []
        const sorted = clusterSignals.sort(
          (a, b) => new Date(b.signal_date).getTime() - new Date(a.signal_date).getTime(),
        )
        return {
          ...cluster,
          signal_count: clusterSignals.length,
          last_signal_date: sorted[0]?.signal_date ?? null,
        } as ClusterWithCount
      }).sort((a, b) => b.signal_count - a.signal_count)
    },
    enabled: !!workspace?.id,
  })
}

export function useUnclusteredCount() {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['signals-unclustered', workspace?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspace!.id)
        .is('cluster_id', null)

      if (error) throw error
      return count ?? 0
    },
    enabled: !!workspace?.id,
  })
}

export function useCluster(clusterId: string) {
  return useQuery({
    queryKey: ['cluster', clusterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problem_clusters')
        .select('*')
        .eq('id', clusterId)
        .single()
      if (error) throw error
      return data as ProblemCluster
    },
    enabled: !!clusterId,
  })
}

export function useClusterSignals(clusterId: string) {
  return useQuery({
    queryKey: ['cluster-signals', clusterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('cluster_id', clusterId)
        .order('signal_date', { ascending: false })
      if (error) throw error
      return data as Signal[]
    },
    enabled: !!clusterId,
  })
}

export function useUpdateClusterStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ clusterId, status }: { clusterId: string; status: ClusterStatus }) => {
      const { error } = await supabase
        .from('problem_clusters')
        .update({ status })
        .eq('id', clusterId)
      if (error) throw error
    },
    onSuccess: (_data, { clusterId }) => {
      queryClient.invalidateQueries({ queryKey: ['cluster', clusterId] })
      queryClient.invalidateQueries({ queryKey: ['clusters'] })
    },
  })
}

export function useOpenQuestions(clusterId: string) {
  return useQuery({
    queryKey: ['open-questions', clusterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_questions')
        .select('*')
        .eq('cluster_id', clusterId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as OpenQuestion[]
    },
    enabled: !!clusterId,
  })
}

export function useAddOpenQuestion(clusterId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: OpenQuestionValues) => {
      const { error } = await supabase.from('open_questions').insert([{
        cluster_id: clusterId,
        question: values.question,
        created_by: user!.id,
      }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-questions', clusterId] })
    },
  })
}

export function useDeleteOpenQuestion(clusterId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('open_questions')
        .delete()
        .eq('id', questionId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-questions', clusterId] })
    },
  })
}

export function useCreateCluster() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ClusterValues) => {
      const { error } = await supabase.from('problem_clusters').insert([{
        workspace_id: workspace!.id,
        name: values.name,
        description: values.description,
        created_by: user!.id,
      }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters', workspace?.id] })
    },
  })
}
