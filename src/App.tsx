import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import RequiresAuth from '@/components/layout/RequiresAuth'
import RequiresWorkspace from '@/components/layout/RequiresWorkspace'
import AppShell from '@/components/layout/AppShell'

import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import WorkspaceSetupPage from '@/pages/onboarding/WorkspaceSetupPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import SignalsPage from '@/pages/signals/SignalsPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import ClusterDetailPage from '@/pages/clusters/ClusterDetailPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import TeamPage from '@/pages/settings/TeamPage'
import SharePage from '@/pages/share/SharePage'
import InvitePage from '@/pages/invite/InvitePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
})

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/share/:token', element: <SharePage /> },
  { path: '/invite/:token', element: <InvitePage /> },
  {
    element: <RequiresAuth />,
    children: [
      { path: '/onboarding', element: <WorkspaceSetupPage /> },
      {
        element: <RequiresWorkspace />,
        children: [
          {
            element: <AppShell />,
            children: [
{ path: '/dashboard', element: <DashboardPage /> },
              { path: '/signals', element: <SignalsPage /> },
              { path: '/analytics', element: <AnalyticsPage /> },
              { path: '/clusters/:clusterId', element: <ClusterDetailPage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/settings/team', element: <TeamPage /> },
            ],
          },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkspaceProvider>
          <RouterProvider router={router} />
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
