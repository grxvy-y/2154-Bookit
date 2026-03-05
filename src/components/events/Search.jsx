import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../assets/styles/Navbar.css'

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const navigate = useNavigate()

    const handleSearch = async (e) => {
        e.preventDefault()

        if (!searchQuery.trim()) return

        setIsSearching(true)

        try {
            // TODO: Replace with actual Supabase code when ready
            // Example:
            // const { data, error } = await supabase
            //   .from('events')
            //   .select('*')
            //   .ilike('name', `%${searchQuery}%`)

            // Simulated delay for now
            await new Promise(resolve => setTimeout(resolve, 500))

            // For now, simply navigate to the browse page with the query as a URL parameter
            // so the Browse page can handle the actual fetching/filtering
            navigate(`/Browse?search=${encodeURIComponent(searchQuery)}`)

        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <form onSubmit={handleSearch} className="navbar-search">
            <svg
                className="navbar-search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
                type="text"
                className="navbar-search-input"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
            />
        </form>
    )
}

export default Search