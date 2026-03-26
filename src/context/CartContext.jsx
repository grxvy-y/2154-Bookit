// CartContext — global shopping cart state, persisted to localStorage
import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
    // Load saved cart from localStorage on first render
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('bookit_cart')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    // Sync cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('bookit_cart', JSON.stringify(cartItems))
    }, [cartItems])

    // Adds an item to the cart, or increments quantity if it already exists
    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                )
            }
            return [...prev, item]
        })
    }

    // Removes a single line item by ID
    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(i => i.id !== id))
    }

    // Updates the quantity of a specific item (min 1)
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return
        setCartItems(prev =>
            prev.map(i => i.id === id ? { ...i, quantity } : i)
        )
    }

    // Clears the entire cart (called after checkout)
    const clearCart = () => setCartItems([])

    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    )
}

// ── useCart hook ───────────────────────────────────────────────────────────────
// Throws if used outside <CartProvider> so the error is immediately obvious.
export const useCart = () => {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
