import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { Signal } from '@/lib/types'

export function useAnalyticsSignals() {
  const { workspace } = useWorkspace()

  return useQuery({
    queryKey: ['analytics-signals', workspace?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('workspace_id', workspace!.id)
        .order('signal_date', { ascending: true })
      if (error) throw error
      return data as Signal[]
    },
    enabled: !!workspace?.id,
  })
}
