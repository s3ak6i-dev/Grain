import { Navigate, Outlet } from 'react-router-dom'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function RequiresWorkspace() {
  const { workspace, loading, needsOnboarding } = useWorkspace()

  if (loading) return <LoadingScreen />
  if (needsOnboarding || !workspace) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
