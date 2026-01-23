import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vtzulsovlvbzdtvrvhbo.supabase.co'
const supabaseAnonKey = 'sb_publishable_DwAG5K1TxIjGTI1IPVuHgw_d1itJRUU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
