// Public-facing ticket page — linked from the QR code.
// Anyone with the URL can view basic event info for the ticket.
// Marking a ticket as used only happens through the StaffScan page.
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'

const VERCEL_BASE = 'https://project-s0w2d.vercel.app'

export default function TicketView() {
    const { id } = useParams()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const fetchTicket = async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    id,
                    qr_code,
                    is_used,
                    ticket_types(name),
                    orders(
                        events(title, date, time, location)
                    )
                `)
                .eq('qr_code', id)
                .single()

            if (error || !data) {
                setNotFound(true)
            } else {
                setTicket(data)
            }
            setLoading(false)
        }

        fetchTicket()
    }, [id])

    if (loading) return (
        <div style={styles.page}>
            <p style={styles.muted}>Loading ticket…</p>
        </div>
    )

    if (notFound) return (
        <div style={styles.page}>
            <div style={styles.card}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✗</p>
                <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Ticket Not Found</h2>
                <p style={styles.muted}>This QR code doesn't match any ticket in our system.</p>
                <Link to="/" style={styles.link}>Back to Bookit</Link>
            </div>
        </div>
    )

    const event = ticket.orders?.events
    const ticketType = ticket.ticket_types

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {ticket.is_used && (
                    <div style={styles.usedBanner}>This ticket has already been used</div>
                )}

                <p style={styles.appName}>Bookit</p>
                <h1 style={styles.eventTitle}>{event?.title || 'Event'}</h1>

                <div style={styles.meta}>
                    <p>📅 {event?.date}{event?.time ? ` · ${event.time}` : ''}</p>
                    <p>📍 {event?.location}</p>
                    {ticketType?.name && <p style={styles.ticketType}>{ticketType.name}</p>}
                </div>

                <div style={{ ...styles.qrWrapper, opacity: ticket.is_used ? 0.4 : 1 }}>
                    <QRCodeSVG
                        value={`${VERCEL_BASE}/ticket/${ticket.qr_code}`}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>

                <p style={styles.hint}>Present this to venue staff at the door</p>
                <Link to="/" style={styles.link}>Browse more events</Link>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
    },
    card: {
        background: 'var(--color-surface-card, #1a1a1a)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '360px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center',
    },
    usedBanner: {
        background: '#ef4444',
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        padding: '0.4rem 1rem',
        borderRadius: '6px',
        width: '100%',
    },
    appName: {
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: '#888',
        textTransform: 'uppercase',
        margin: 0,
    },
    eventTitle: {
        fontSize: '1.4rem',
        fontWeight: 700,
        margin: 0,
    },
    meta: {
        fontSize: '0.875rem',
        color: '#aaa',
        lineHeight: 1.8,
    },
    ticketType: {
        color: '#f59e0b',
        fontWeight: 600,
        fontSize: '0.8rem',
    },
    qrWrapper: {
        background: '#fff',
        padding: '0.75rem',
        borderRadius: '10px',
    },
    hint: {
        fontSize: '0.75rem',
        color: '#666',
        margin: 0,
    },
    link: {
        fontSize: '0.85rem',
        color: '#f59e0b',
        textDecoration: 'none',
    },
    muted: {
        color: '#888',
    },
}
