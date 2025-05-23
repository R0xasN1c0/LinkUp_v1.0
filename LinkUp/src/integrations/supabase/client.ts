
/**
 * Supabase Client Configuration for LinkUp
 * 
 * This file configures and exports the Supabase client for LinkUp.
 * The client is used throughout the application to interact with the Supabase backend.
 * 
 * IMPORTANT: Do not edit this file directly as it is automatically generated.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase connection credentials
const SUPABASE_URL = "https://tdlpnmogymbkdgyeplae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbHBubW9neW1ia2RneWVwbGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NDU3NzMsImV4cCI6MjA2MTAyMTc3M30.18wtwRUmLuLZLMs9fLvQjWBu4OHOoMOsaw5ttgX9_S4";

/**
 * Import the Supabase client like this:
 * import { supabase } from "@/integrations/supabase/client";
 * 
 * The client is typed with our database schema for better type safety.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
