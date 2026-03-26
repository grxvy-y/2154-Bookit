// Layout — persistent shell that wraps every page (Navbar + page content)
import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import '../../assets/styles/Layout.css'

const Layout = () => {
    return (
        <>
            <Navbar />
            {/* Matched route is rendered here via react-router's <Outlet> */}
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Layout
