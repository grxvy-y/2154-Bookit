import { useState } from 'react'
import EventCard from '../components/events/EventCard'
import '../assets/styles/Event.css'

// Placeholder events until organizers create real ones via the dashboard
const MOCK_EVENTS = [
    {
        id: 'mock-1',
        name: 'Networking Event',
        date: '2026-04-05',
        time: '12:00 PM',
        location: 'Downtown Conference Centre',
        description: 'Connect and network with professionals in the Developer field.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80',
        ticket_types: [
            { id: 'mock-1-general', name: 'General Admission', price: 15.00 },
            { id: 'mock-1-vip', name: 'VIP', price: 45.00 },
        ]
    },
    {
        id: 'mock-2',
        name: 'Birthday Celebration',
        date: '2026-04-19',
        time: '5:00 PM',
        location: 'The Grand Hall',
        description: 'Join us for an unforgettable birthday celebration!',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80',
        ticket_types: [
            { id: 'mock-2-general', name: 'General Admission', price: 0 },
        ]
    },
    {
        id: 'mock-3',
        name: 'Wedding Reception',
        date: '2026-05-27',
        time: '5:00 PM',
        location: 'Rosewater Gardens',
        description: 'John and Jane Doe invite you to celebrate their wedding reception.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80',
        ticket_types: [
            { id: 'mock-3-general', name: 'General Admission', price: 0 },
        ]
    },
    {
        id: 'mock-4',
        name: 'Tech Startup Pitch Night',
        date: '2026-04-12',
        time: '6:30 PM',
        location: 'Innovation Hub',
        description: 'Watch the next generation of startups pitch their ideas to investors.',
        image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&q=80',
        ticket_types: [
            { id: 'mock-4-general', name: 'General Admission', price: 10.00 },
            { id: 'mock-4-investor', name: 'Investor Pass', price: 75.00 },
        ]
    },
]

const Browse = () => {
    const [search, setSearch] = useState('')

    const filtered = MOCK_EVENTS.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
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

            {filtered.length === 0 ? (
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
