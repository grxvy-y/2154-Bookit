import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const VERCEL_BASE = 'https://project-s0w2d.vercel.app'

export default function MyTickets() {
    const { user } = useAuth()
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTickets = async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    id,
                    qr_code,
                    is_used,
                    created_at,
                    ticket_types(name, price),
                    orders(
                        id,
                        events(title, date, time, location)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching tickets:', error)
                setError('Could not load your tickets.')
            } else {
                setTickets(data || [])
            }
            setLoading(false)
        }

        fetchTickets()
    }, [user.id])

    if (loading) return (
        <div style={styles.page}>
            <p style={styles.muted}>Loading your tickets…</p>
        </div>
    )

    if (error) return (
        <div style={styles.page}>
            <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
    )

    return (
        <div style={styles.page}>
            <h1 style={styles.heading}>My Tickets</h1>
            <p style={styles.muted}>Screenshot or save your QR codes to show at the door.</p>

            {tickets.length === 0 ? (
                <p style={styles.muted}>You haven't purchased any tickets yet.</p>
            ) : (
                <div style={styles.grid}>
                    {tickets.map(ticket => {
                        const event = ticket.orders?.events
                        const ticketType = ticket.ticket_types
                        return (
                            <div key={ticket.id} style={{ ...styles.card, opacity: ticket.is_used ? 0.5 : 1 }}>
                                {ticket.is_used && (
                                    <div style={styles.usedBadge}>USED</div>
                                )}
                                <div style={styles.eventInfo}>
                                    <p style={styles.eventTitle}>{event?.title || 'Event'}</p>
                                    <p style={styles.eventMeta}>📅 {event?.date}{event?.time ? ` · ${event.time}` : ''}</p>
                                    <p style={styles.eventMeta}>📍 {event?.location}</p>
                                    {ticketType?.name && (
                                        <p style={styles.ticketType}>{ticketType.name}</p>
                                    )}
                                </div>
                                <div style={styles.qrWrapper}>
                                    <QRCodeSVG
                                        value={`${VERCEL_BASE}/ticket/${ticket.qr_code}`}
                                        size={160}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                    />
                                </div>
                                <p style={styles.hint}>Show this at the door</p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const styles = {
    page: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1rem',
    },
    heading: {
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '0.25rem',
    },
    muted: {
        color: '#888',
        marginBottom: '1.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem',
    },
    card: {
        background: 'var(--color-surface-card, #1a1a1a)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
    },
    usedBadge: {
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        background: '#ef4444',
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: 'bold',
        padding: '0.2rem 0.4rem',
        borderRadius: '4px',
        letterSpacing: '0.05em',
    },
    eventInfo: {
        width: '100%',
        textAlign: 'center',
    },
    eventTitle: {
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: '0.25rem',
    },
    eventMeta: {
        fontSize: '0.8rem',
        color: '#aaa',
        margin: '0.1rem 0',
    },
    ticketType: {
        fontSize: '0.75rem',
        color: '#f59e0b',
        fontWeight: 600,
        marginTop: '0.25rem',
    },
    qrWrapper: {
        background: '#fff',
        padding: '0.75rem',
        borderRadius: '8px',
    },
    hint: {
        fontSize: '0.75rem',
        color: '#888',
        margin: 0,
    },
}
