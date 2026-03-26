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
        navigate('/')
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

            {profile?.role === 'organizer' && (
                <NavLink to="/Organizer" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                    Organizer
                </NavLink>
            )}

            {user && (
                <NavLink to="/Cart" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                    Cart{cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
                </NavLink>
            )}

            {/* Push CTA to the right */}
            <div className="navbar-spacer" />

                        {/* Search Bar - Moved next to CTA for better flow */}
            <div className="hidden md:block mr-2">
                <Search />
            </div>

            <div className="hidden md:block mr-2">
                <Search />
            </div>

            {/* Auth controls */}
            {user ? (
                <div className="navbar-user">
                    <span className="navbar-username">
                        {profile?.full_name || user.email}
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
