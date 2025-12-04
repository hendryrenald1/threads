// src/lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // helps with URL/crypto in RN

const SUPABASE_URL = 'https://nwykqqjsazuazhjechht.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eWtxcWpzYXp1YXpoamVjaGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzUyNTIsImV4cCI6MjA4MDM1MTI1Mn0.sJ61yezlyco7xtXJfYR3nM0pdyvVGkofVjJTaGmSh7Y';

// NOTE: Replace the above two strings with your real values.

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // not needed in RN
  },
});
