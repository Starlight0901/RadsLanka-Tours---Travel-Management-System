import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { useAuth } from '@/hooks/useAuth.ts'
import { paths } from '@/routes/paths.ts'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingState label="Checking admin session" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={paths.admin.login} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
