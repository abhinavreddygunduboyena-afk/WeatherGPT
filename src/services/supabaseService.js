import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

let supabaseInstance = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.info('Supabase client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  // Silent fallback mode with localStorage persistence
  console.info('Supabase credentials not configured. WeatherGPT operating in resilient local storage demo mode.');
}

export const supabase = supabaseInstance;

/**
 * Fetch projects from Supabase with fallback to localStorage
 */
export async function fetchProjectsFromDB() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('energy_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return { data, isLiveDB: true };
    } catch (e) {
      console.warn('Supabase query failed, falling back to local storage:', e.message);
    }
  }

  // Fallback to local storage
  const local = localStorage.getItem('weathergpt_energy_projects');
  if (local) {
    try {
      return { data: JSON.parse(local), isLiveDB: false };
    } catch (e) {}
  }

  return { data: null, isLiveDB: false };
}
