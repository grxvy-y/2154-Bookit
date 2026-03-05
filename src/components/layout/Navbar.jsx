import React from 'react'
import { NavLink } from 'react-router-dom'
import Search from '../events/Search'
import '../../assets/styles/Navbar.css'

const Navbar = () => {
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

            <NavLink to="/Organizer" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                Organizer
            </NavLink>

            <NavLink to="/Cart" className={({ isActive }) => `navbar-btn${isActive ? ' navbar-btn--active' : ''}`}>
                Cart
            </NavLink>

            {/* Push CTA to the right */}
            <div className="navbar-spacer" />

            {/* Search Bar - Moved next to CTA for better flow */}
            <div className="hidden md:block mr-2">
                <Search />
            </div>

            {/* CTA */}
            <NavLink to="/Browse" className="navbar-btn navbar-btn--cta">
                Find Events
            </NavLink>

        </div>
    )
}

export default Navbar
