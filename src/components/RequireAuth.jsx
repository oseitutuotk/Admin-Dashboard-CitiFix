// src/components/RequireAuth.jsx — new file
import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export default function RequireAuth() {
  const { session, loading } = useSession()
  if (loading) return null // could be a spinner; app boots fast enough to skip for now
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}