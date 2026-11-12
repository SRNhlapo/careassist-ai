import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles, children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <p className='p-6'>Loading...</p>
  if (!session) return <Navigate to='/login' replace />
  if (roles && !roles.includes(profile?.role)) return <p className='p-6'>Not authorised.</p>
  return children
}