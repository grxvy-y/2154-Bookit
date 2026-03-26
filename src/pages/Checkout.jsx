import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import '../assets/styles/Checkout.css'

// ── Step indicator ───────────────────────────────────────────
const STEPS = ['Review Order', 'Payment', 'Confirmation']

const StepBar = ({ current }) => (
    <div className="checkout-steps">
        {STEPS.map((label, i) => {
            const num = i + 1
            const done = num < current
            const active = num === current
            return (
                <div key={label} className={`checkout-step${active ? ' checkout-step--active' : ''}${done ? ' checkout-step--done' : ''}`}>
                    <div className="checkout-step__circle">{done ? '✓' : num}</div>
                    <span>{label}</span>
                    {i < STEPS.length - 1 && <div className="checkout-step__line" />}
                </div>
            )
        })}
    </div>
)

// ── Step 1: Review ───────────────────────────────────────────
const ReviewStep = ({ cartItems, cartTotal, onNext }) => (
    <div className="checkout-card">
        <h2>Review your order</h2>
        <div className="checkout-items">
            {cartItems.map(item => (
                <div key={item.id} className="checkout-item">
                    <div>
                        <p className="checkout-item__title">{item.eventTitle}</p>
                        <p className="checkout-item__meta">{item.ticketTypeName} × {item.quantity}</p>
                        <p className="checkout-item__meta">📅 {item.date} &nbsp;·&nbsp; 📍 {item.location}</p>
                    </div>
                    <span className="checkout-item__price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
        </div>
        <div className="checkout-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
        </div>
        <button className="checkout-btn" onClick={onNext}>Continue to Payment →</button>
        <Link to="/Cart" className="checkout-back">← Back to cart</Link>
    </div>
)

// ── Step 2: Payment ──────────────────────────────────────────
const PaymentStep = ({ cartTotal, onPay, loading }) => {
    const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
    const [errors, setErrors] = useState({})

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

    const formatCardNumber = (val) =>
        val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4)
        return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (form.number.replace(/\s/g, '').length !== 16) e.number = 'Enter a valid 16-digit card number'
        const [mm, yy] = form.expiry.split('/')
        if (!mm || !yy || isNaN(mm) || isNaN(yy) || Number(mm) < 1 || Number(mm) > 12)
            e.expiry = 'Enter a valid expiry (MM/YY)'
        if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = 'Enter a valid CVV'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        onPay()
    }

    return (
        <div className="checkout-card">
            <h2>Payment details</h2>
            <p className="checkout-mock-notice">🔒 This is a simulated payment — no real charge will occur.</p>

            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
                <div className="checkout-field">
                    <label>Name on card</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Jane Doe"
                    />
                    {errors.name && <span className="checkout-field__error">{errors.name}</span>}
                </div>

                <div className="checkout-field">
                    <label>Card number</label>
                    <input
                        type="text"
                        value={form.number}
                        onChange={e => set('number', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                    />
                    {errors.number && <span className="checkout-field__error">{errors.number}</span>}
                </div>

                <div className="checkout-field-row">
                    <div className="checkout-field">
                        <label>Expiry</label>
                        <input
                            type="text"
                            value={form.expiry}
                            onChange={e => set('expiry', formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            inputMode="numeric"
                        />
                        {errors.expiry && <span className="checkout-field__error">{errors.expiry}</span>}
                    </div>
                    <div className="checkout-field">
                        <label>CVV</label>
                        <input
                            type="text"
                            value={form.cvv}
                            onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            inputMode="numeric"
                        />
                        {errors.cvv && <span className="checkout-field__error">{errors.cvv}</span>}
                    </div>
                </div>

                <div className="checkout-total">
                    <span>Amount due</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>

                <button type="submit" className="checkout-btn" disabled={loading}>
                    {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                </button>
            </form>
        </div>
    )
}

// ── Step 3: Confirmation ─────────────────────────────────────
const ConfirmationStep = ({ orderRefs }) => (
    <div className="checkout-card checkout-card--confirm">
        <div className="checkout-confirm__icon">🎉</div>
        <h2>You're booked!</h2>
        <p className="checkout-confirm__sub">
            Your order has been confirmed. Check your email for your tickets.
        </p>
        {orderRefs.length > 0 && (
            <div className="checkout-confirm__refs">
                {orderRefs.map(ref => (
                    <p key={ref.id} className="checkout-confirm__ref">
                        <strong>{ref.eventTitle}</strong><br />
                        Order ID: <code>{ref.id}</code>
                    </p>
                ))}
            </div>
        )}
        <Link to="/Browse" className="checkout-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
            Browse More Events
        </Link>
    </div>
)

// ── Main component ───────────────────────────────────────────
const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [orderRefs, setOrderRefs] = useState([])

    if (cartItems.length === 0 && step !== 3) {
        navigate('/Cart')
        return null
    }

    const handlePay = async () => {
        setLoading(true)
        const refs = []

        // Group cart items by eventId so we create one order per event
        const groups = {}
        cartItems.forEach(item => {
            if (!groups[item.eventId]) {
                groups[item.eventId] = { eventId: item.eventId, eventTitle: item.eventTitle, items: [], total: 0 }
            }
            groups[item.eventId].items.push(item)
            groups[item.eventId].total += item.price * item.quantity
        })

        for (const group of Object.values(groups)) {
            // Skip DB write for placeholder mock events (no real UUID)
            if (group.eventId.startsWith('mock-')) {
                refs.push({ id: `MOCK-${Date.now()}`, eventTitle: group.eventTitle })
                continue
            }

            // Create order
            const { data: order, error: orderErr } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    event_id: group.eventId,
                    status: 'confirmed',
                    total_amount: group.total,
                })
                .select()
                .single()

            if (orderErr) {
                console.error('Order insert failed:', orderErr)
                continue
            }

            // Create one ticket row per individual ticket
            const ticketRows = []
            for (const item of group.items) {
                for (let i = 0; i < item.quantity; i++) {
                    ticketRows.push({
                        order_id: order.id,
                        ticket_type_id: item.ticketTypeId,
                        user_id: user.id,
                        qr_code: crypto.randomUUID(),
                    })
                }
            }

            await supabase.from('tickets').insert(ticketRows)
            refs.push({ id: order.id, eventTitle: group.eventTitle })
        }

        setOrderRefs(refs)
        clearCart()
        setLoading(false)
        setStep(3)
    }

    return (
        <div className="checkout-page">
            <StepBar current={step} />
            {step === 1 && <ReviewStep cartItems={cartItems} cartTotal={cartTotal} onNext={() => setStep(2)} />}
            {step === 2 && <PaymentStep cartTotal={cartTotal} onPay={handlePay} loading={loading} />}
            {step === 3 && <ConfirmationStep orderRefs={orderRefs} />}
        </div>
    )
}

export default Checkout
