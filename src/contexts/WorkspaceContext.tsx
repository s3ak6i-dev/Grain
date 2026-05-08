import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { Workspace, WorkspaceRole } from '@/lib/types'

interface WorkspaceContextValue {
  workspace: Workspace | null
  role: WorkspaceRole | null
  loading: boolean
  needsOnboarding: boolean
  refresh: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [role, setRole] = useState<WorkspaceRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const hasLoaded = useRef(false)

  const load = useCallback(async () => {
    if (!user) {
      setWorkspace(null)
      setRole(null)
      setNeedsOnboarding(false)
      setLoading(false)
      hasLoaded.current = false
      return
    }

    // Only show loading screen on initial load, not on background token refreshes
    if (!hasLoaded.current) setLoading(true)

    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (memberError || !member) {
      setWorkspace(null)
      setRole(null)
      setNeedsOnboarding(true)
      setLoading(false)
      return
    }

    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', member.workspace_id)
      .single()

    if (wsError || !ws) {
      setWorkspace(null)
      setRole(null)
      setNeedsOnboarding(true)
      setLoading(false)
      return
    }

    setWorkspace(ws as Workspace)
    setRole(member.role as WorkspaceRole)
    setNeedsOnboarding(false)
    hasLoaded.current = true
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return (
    <WorkspaceContext.Provider value={{ workspace, role, loading, needsOnboarding, refresh: load }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
