// Supabase client singleton — import { supabase } from here throughout the app.
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
