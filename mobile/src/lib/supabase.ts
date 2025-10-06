import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cwanreihurpjjqypxdyk.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YW5yZWlodXJwampxeXB4ZHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzU3MTIsImV4cCI6MjA2NjIxMTcxMn0.ZEV5HEJKffc_3qRs8z8plvoo9FEDlimXwgG8USZAcoM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

