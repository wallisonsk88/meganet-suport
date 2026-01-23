import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vtzulsovlvbzdtvrvhbo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DwAG5K1TxIjGTI1IPVuHgw_d1itJRUU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
