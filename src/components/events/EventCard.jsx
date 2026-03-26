import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import '../../assets/styles/Event.css'

const EventCard = ({ event }) => {
    const { addToCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    // Which ticket type is currently selected in the dropdown (index into ticketTypes)
    const [selectedType, setSelectedType] = useState(0)
    const [quantity, setQuantity] = useState(1)
    // Briefly true after adding to cart so the button shows a confirmation tick
    const [added, setAdded] = useState(false)

    // RSVP code state
    const [rsvpInput, setRsvpInput] = useState('')
    const [showRsvpPrompt, setShowRsvpPrompt] = useState(false)
    const [rsvpError, setRsvpError] = useState('')

    // Use ticket_types from the DB if available; otherwise fall back to a single
    // 'General Admission' entry derived from the legacy event.price field
    const ticketTypes = event.ticket_types?.length
        ? event.ticket_types
        : [{ id: `${event.id ?? event.name}-general`, name: 'General Admission', price: event.price ?? 0 }]

    const chosen = ticketTypes[selectedType]

    // [NEW] Recurring Community Events use a special ticket type named 'Recurring Event'.
    // When this flag is true the card switches to an announcement-style layout:
    //   • shows a yellow 🔁 badge instead of a price
    //   • displays the recurring schedule instead of a single date
    //   • replaces 'Add to Cart' with 'RSVP'
    //   • hides the quantity stepper (free events don't need quantity selection)
    const isAnnouncement = chosen.name === 'Recurring Event'

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login')
            return
        }

        // Check if event requires an RSVP code
        if (event.rsvp_code && !showRsvpPrompt) {
            setShowRsvpPrompt(true)
            return
        }

        if (showRsvpPrompt) {
            if (rsvpInput.trim().toLowerCase() !== event.rsvp_code.trim().toLowerCase()) {
                setRsvpError('Incorrect code. Please try again.')
                return
            }
            setRsvpError('')
        }

        addToCart({
            id: `${event.id ?? event.name}-${chosen.id}`,
            eventId: event.id ?? event.name,
            eventTitle: event.name ?? event.title,
            ticketTypeId: chosen.id,
            ticketTypeName: chosen.name,
            price: chosen.price,
            quantity,
            date: event.date,
            location: event.location,
        })
        setShowRsvpPrompt(false)
        setRsvpInput('')
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className="event-card">
            {event.image && (
                <img className="event-card__image" src={event.image ?? event.image_url} alt={event.name ?? event.title} />
            )}
            <div className="event-card__body">
                <h2 className="event-card__title" style={{ marginBottom: isAnnouncement ? '0.25rem' : '0.5rem' }}>
                    {event.name ?? event.title}
                </h2>
                {/* [NEW] Yellow badge shown only for recurring/community announcements */}
                {isAnnouncement && (
                    <span style={{ display: 'inline-block', marginBottom: '0.75rem', background: '#eab308', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        🔁 Recurring Event
                    </span>
                )}
                {/* [NEW] Date line: recurring events show their weekly schedule + date range;
                         regular events show a single date and optional time */}
                <p className="event-card__meta">
                    {isAnnouncement && event.recurring_days ? (
                        `📅 Every ${event.recurring_days} (from ${event.date} until ${event.end_date})`
                    ) : (
                        `📅 ${event.date}  ${event.time ? `· ${event.time}` : ''}`
                    )}
                </p>
                <p className="event-card__meta">📍 {event.location}</p>
                {event.description && (
                    <p className="event-card__desc">{event.description}</p>
                )}

                {/* Ticket type selector */}
                {ticketTypes.length > 1 && (
                    <div className="event-card__field">
                        <label className="event-card__label">Ticket type</label>
                        <select
                            className="event-card__select"
                            value={selectedType}
                            onChange={e => setSelectedType(Number(e.target.value))}
                        >
                            {ticketTypes.map((t, i) => (
                                <option key={t.id} value={i}>
                                    {t.name} — ${Number(t.price).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* [NEW] Footer layout changes for announcements: stacked column instead of row */}
                <div className="event-card__footer" style={isAnnouncement ? { flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' } : {}}>
                    {/* [NEW] Price label: announcements show price if > 0, else 'Community Event' */}
                    <span className="event-card__price" style={isAnnouncement ? { alignSelf: 'center', margin: '0.5rem 0' } : {}}>
                        {isAnnouncement ? (chosen.price > 0 ? `$${Number(chosen.price).toFixed(2)}` : 'Community Event') : chosen.price === 0 ? 'Free' : `$${Number(chosen.price).toFixed(2)}`}
                    </span>

                    {/* [NEW] Quantity stepper is hidden for FREE recurring events, but shown if they cost money */}
                    {!(isAnnouncement && chosen.price == 0) && !showRsvpPrompt && (
                        <div className="event-card__qty">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    )}

                    {/* [NEW] RSVP Code Prompt */}
                    {showRsvpPrompt && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Enter RSVP Code:</label>
                            <input 
                                type="text"
                                value={rsvpInput}
                                onChange={e => setRsvpInput(e.target.value)}
                                placeholder="Code"
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {rsvpError && <span style={{ color: 'red', fontSize: '0.75rem' }}>{rsvpError}</span>}
                        </div>
                    )}

                    {/* [NEW] CTA button: 'RSVP' for free announcements, 'Add to Cart' for tickets. */}
                    <button
                        className={`event-card__btn${added ? ' event-card__btn--added' : ''}`}
                        onClick={handleAddToCart}
                        style={isAnnouncement ? { width: '100%' } : {}}
                    >
                        {added 
                            ? (isAnnouncement && chosen.price == 0 ? '✓ RSVP Confirmed' : '✓ Added') 
                            : showRsvpPrompt ? 'Submit Code' : (isAnnouncement && chosen.price == 0 ? 'RSVP' : 'Add to Cart')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EventCard
