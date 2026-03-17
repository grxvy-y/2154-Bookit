import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, profile, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/login" replace />

    if (requiredRole && profile?.role !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
