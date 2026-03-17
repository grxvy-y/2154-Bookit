import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../assets/styles/Cart.css'

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <div className="cart-empty__icon">🎟️</div>
                <h2>Your cart is empty</h2>
                <p>Browse events and add tickets to get started.</p>
                <Link to="/Browse" className="cart-browse-btn">Browse Events</Link>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Your Cart</h1>
                <button className="cart-clear-btn" onClick={clearCart}>Clear all</button>
            </div>

            <div className="cart-layout">
                {/* Line items */}
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item__info">
                                <h3 className="cart-item__title">{item.eventTitle}</h3>
                                <p className="cart-item__meta">{item.ticketTypeName}</p>
                                <p className="cart-item__meta">📅 {item.date} &nbsp;·&nbsp; 📍 {item.location}</p>
                            </div>

                            <div className="cart-item__controls">
                                {/* Quantity */}
                                <div className="cart-item__qty">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >−</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>

                                {/* Line total */}
                                <span className="cart-item__subtotal">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>

                                {/* Remove */}
                                <button
                                    className="cart-item__remove"
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label="Remove"
                                >✕</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order summary */}
                <div className="cart-summary">
                    <h2 className="cart-summary__title">Order Summary</h2>

                    <div className="cart-summary__rows">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-summary__row">
                                <span>{item.eventTitle} × {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary__total">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>

                    <Link to="/checkout" className="cart-checkout-btn">
                        Proceed to Checkout →
                    </Link>

                    <Link to="/Browse" className="cart-continue-link">
                        ← Continue browsing
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Cart
