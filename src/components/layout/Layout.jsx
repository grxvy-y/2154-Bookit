import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import '../../assets/styles/Layout.css'

const Layout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Layout
