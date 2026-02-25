// src/lib/analyticsSupabase.js
import { createClient } from "@supabase/supabase-js";

const analyticsUrl = import.meta.env.VITE_ANALYTICS_SUPABASE_URL;
const analyticsAnonKey = import.meta.env.VITE_ANALYTICS_SUPABASE_ANON_KEY;

export const analyticsSupabase = createClient(analyticsUrl, analyticsAnonKey);
