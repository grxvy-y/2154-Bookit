import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import EventCard from '../components/events/EventCard'
import '../assets/styles/Event.css'

const Browse = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*, ticket_types(*)')
                .eq('status', 'published')
                .order('date', { ascending: true })
            
            if (error) {
                console.error('Error fetching events:', error)
            } else {
                setEvents(data || [])
            }
            setLoading(false)
        }

        fetchEvents()
    }, [])

    const filtered = events.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 700 }}>Browse Events</h1>
                <p style={{ color: '#666', margin: '0 0 1.25rem' }}>Find something happening near you.</p>
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '0.65rem 1rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        width: '100%',
                        maxWidth: '400px',
                    }}
                />
            </div>

            {loading ? (
                <p style={{ color: '#888' }}>Loading events...</p>
            ) : filtered.length === 0 ? (
                <p style={{ color: '#888' }}>No events match your search.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {filtered.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Browse
