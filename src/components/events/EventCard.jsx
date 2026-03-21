import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import '../../assets/styles/Event.css'

const EventCard = ({ event }) => {
    const { addToCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [selectedType, setSelectedType] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

    const ticketTypes = event.ticket_types?.length
        ? event.ticket_types
        : [{ id: `${event.id ?? event.name}-general`, name: 'General Admission', price: event.price ?? 0 }]

    const chosen = ticketTypes[selectedType]
    const isAnnouncement = chosen.name === 'Recurring Event'

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login')
            return
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
                {isAnnouncement && (
                    <span style={{ display: 'inline-block', marginBottom: '0.75rem', background: '#eab308', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        🔁 Recurring Event
                    </span>
                )}
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

                <div className="event-card__footer" style={isAnnouncement ? { flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' } : {}}>
                    <span className="event-card__price" style={isAnnouncement ? { alignSelf: 'center', margin: '0.5rem 0' } : {}}>
                        {isAnnouncement ? 'Community Event' : chosen.price === 0 ? 'Free' : `$${Number(chosen.price).toFixed(2)}`}
                    </span>

                    {!isAnnouncement && (
                        <div className="event-card__qty">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    )}

                    <button
                        className={`event-card__btn${added ? ' event-card__btn--added' : ''}`}
                        onClick={handleAddToCart}
                        style={isAnnouncement ? { width: '100%' } : {}}
                    >
                        {added 
                            ? (isAnnouncement ? '✓ RSVP Confirmed' : '✓ Added') 
                            : (isAnnouncement ? 'RSVP' : 'Add to Cart')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EventCard
