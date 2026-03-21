import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        setProfile(data)
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, fullName, role) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role: role } }
        })
        if (error) return { error }

        // Set role on the profile (trigger creates it with default 'attendee')
        if (data.user && role !== 'attendee') {
            await supabase
                .from('profiles')
                .update({ role })
                .eq('id', data.user.id)
            
            // Re-fetch profile to ensure UI gets updated role immediately
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
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
