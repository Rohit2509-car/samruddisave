import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://tmbkqbbodfdgiofaiaxx.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYmtxYmJvZGZkZ2lvZmFpYXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDM3NTUsImV4cCI6MjEwMTMxOTc1NX0.Ob0fHIghRGM8d-8nH5sgQULcltCuQG0wfqmY80CCA4Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
