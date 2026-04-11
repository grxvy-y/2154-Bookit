// Navbar — top navigation bar with conditional links, cart badge, and auth controls
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Search from '../events/Search'
import '../../assets/styles/Navbar.css'

const Navbar = () => {
    const { user, profile, signOut } = useAuth()
    const { cartCount } = useCart()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/') // Redirect home so protected pages aren't shown after logout
    }

    return (
        <div className="navbar">

            {/* Logo */}
            <NavLink to="/" className="navbar-logo">
                Book<span>it</span>
            </NavLink>

            {/* Navbar links */}
            <NavLink to="/" end className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                Home
            </NavLink>

            <NavLink to="/Browse" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                Browse Events
            </NavLink>

            {/* Only shown to organizers */}
            {profile?.role === 'organizer' && (
              <>
                <NavLink to="/Organizer" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>Organizer</NavLink>
                <NavLink to="/staff/scan" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>Scan Tickets</NavLink>
              </>
            )}

            {/* Scan Tickets for venue staff */}
            {profile?.role === 'venue_staff' && (
              <NavLink to="/staff/scan" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>Scan Tickets</NavLink>
            )}

            {/* My Tickets — only shown to logged-in attendees */}
            {user && profile?.role === 'attendee' && (
                <NavLink to="/my-tickets" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                    My Tickets
                </NavLink>
            )}

            {/* Cart with live item count badge — only shown when logged in */}
            {user && (
                <NavLink to="/Cart" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                    Cart{cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
                </NavLink>
            )}

            {/* Push right-side elements to the right */}
            <div className="navbar-spacer" />

            {/* Search bar */}
            <div className="hidden md:block mr-2">
                <Search />
            </div>

            {/* Auth controls */}
            {user ? (
                <div className="navbar-user">
                    <span className="navbar-username" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {profile?.full_name || user.email}
                        {/* HOST badge for organizer accounts */}
                        {profile?.role === 'organizer' && (
                            <span title="Organizer" style={{ background: '#f59e0b', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.3rem', borderRadius: '4px', fontWeight: 'bold', lineHeight: 1 }}>
                                HOST
                            </span>
                        )}
                    </span>
                    <button className="navbar-btn navbar-btn--cta" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            ) : (
                <div className="navbar-user">
                    <NavLink to="/login" className="navbar-btn">
                        Sign In
                    </NavLink>
                    <NavLink to="/register" className="navbar-btn navbar-btn--cta">
                        Sign Up
                    </NavLink>
                </div>
            )}
        </div>
    )
}

export default Navbar
