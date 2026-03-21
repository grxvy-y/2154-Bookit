// App — root component, provider setup, and route definitions
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Organizer from './pages/Organizer'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'

const App = () => {
    return (
        <AuthProvider>
          <CartProvider>
            <Router>
                <Routes>
                    <Route element={<Layout />}>

                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/Browse" element={<Browse />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes — require login */}
                        <Route path="/Cart" element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        } />
                        {/* Organizer dashboard — requires role='organizer' */}
                        <Route path="/Organizer" element={
                            <ProtectedRoute requiredRole="organizer">
                                <Organizer />
                            </ProtectedRoute>
                        } />

                    </Route>
                </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
    )
}

export default App
