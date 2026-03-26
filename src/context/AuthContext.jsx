/**
 * AuthContext.jsx — Global authentication context
 *
 * Provides the current Supabase auth session (user), the extended profile row
 * from the public.profiles table, and helper methods for sign-up/in/out.
 *
 * How to use in a component:
 *   const { user, profile, loading, signIn, signOut } = useAuth()
 *
 * Context value exposed:
 *   user     — Supabase Auth User object (null if logged out)
 *   profile  — Row from public.profiles { id, full_name, role, created_at }
 *   loading  — true while the initial session check is in progress
 *   signUp   — (email, password, fullName, role) => Promise<{ data, error }>
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Default null so useAuth() can detect a missing provider
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetches the profiles row for a given user ID
    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        setProfile(data)
    }

    useEffect(() => {
        // Resolve the existing session on page load
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            }
            setLoading(false)
        })

        // Keep state in sync with login/logout/token-refresh events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
        })

        // Cleanup: unsubscribe from the listener when the provider unmounts
        return () => subscription.unsubscribe()
    }, [])

    // Creates a new account. If role !== 'attendee', manually updates the profile
    // because the DB trigger defaults new users to 'attendee'.
    const signUp = async (email, password, fullName, role) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role: role } }
        })
        if (error) return { error }

        if (data.user && role !== 'attendee') {
            await supabase
                .from('profiles')
                .update({ role })
                .eq('id', data.user.id)
            await fetchProfile(data.user.id)
        }
        return { data }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        return { data, error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        // onAuthStateChange clears user + profile automatically
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

// Throws if called outside <AuthProvider>
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
