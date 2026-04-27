import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSessionStore } from '@/store/sessionStore'
import { PageSpinner } from '@/components/ui/Spinner'

const LoginPage         = lazy(() => import('@/pages/LoginPage'))
const BranchPicker      = lazy(() => import('@/pages/BranchPicker'))
const WorkspacePage     = lazy(() => import('@/pages/WorkspacePage'))
const SettingsPage      = lazy(() => import('@/pages/SettingsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5_000, refetchOnWindowFocus: true },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, branch } = useSessionStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (!branch) return <Navigate to="/branch" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/branch"    element={<BranchPicker />} />
            <Route path="/workspace" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/"          element={<Navigate to="/workspace" replace />} />
            <Route path="*"          element={<Navigate to="/workspace" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
