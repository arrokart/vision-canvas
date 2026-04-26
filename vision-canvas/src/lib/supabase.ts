import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tzzbinwvtuvjhynlmjzo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6emJpbnd2dHV2amh5bmxtanpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTQwNDgsImV4cCI6MjA5Mjc5MDA0OH0.J5evLhHjvW3hn280SelzkenehL1qj7uHjW8uG-3HvZY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)