import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('bookit_cart')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    // Persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem('bookit_cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (item) => {
        // item: { id, eventId, eventTitle, ticketTypeId, ticketTypeName, price, quantity, date, location }
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

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(i => i.id !== id))
    }

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return
        setCartItems(prev =>
            prev.map(i => i.id === id ? { ...i, quantity } : i)
        )
    }

    const clearCart = () => setCartItems([])

    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
