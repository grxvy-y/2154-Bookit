import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, profile, loading } = useAuth()

    if (loading) return null

    if (!user) return (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', background: '#ffebee', color: '#c62828', minHeight: '60vh' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied: Not Logged In</h2>
            <p>You must be logged in to access this page.</p>
            <Link to="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.6rem 1.2rem', background: '#c62828', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                Return to Home
            </Link>
        </div>
    )

    if (requiredRole && profile?.role !== requiredRole) {
        return (
            <div style={{ padding: '5rem 2rem', textAlign: 'center', background: '#ffebee', color: '#c62828', minHeight: '60vh' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied: Wrong Role</h2>
                <p style={{ marginBottom: '0.5rem' }}>We checked your account in the database and you do not have permission.</p>
                <p style={{ fontWeight: 'bold' }}>Required role: {requiredRole}</p>
                <p style={{ fontWeight: 'bold' }}>Your actual role: {profile?.role || 'none / loading failed'}</p>
                <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>If your actual role is 'attendee', you must manually update it in the Supabase Table Editor or successfully register a new account.</p>
                <Link to="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.6rem 1.2rem', background: '#c62828', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                    Return to Home
                </Link>
            </div>
        )
    }

    return children
}

export default ProtectedRoute
