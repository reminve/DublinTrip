import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

// Auto-initialize from Vite environment variables if present
if (envUrl && envKey && envUrl !== "https://votre-projet.supabase.co") {
  try {
    supabaseClient = createClient(envUrl, envKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client from env", e);
  }
}

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  const url = localStorage.getItem("sb_url");
  const key = localStorage.getItem("sb_key");
  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (e) {
      console.error("Failed to initialize Supabase client from localstorage", e);
    }
  }
  return null;
};

export const resetSupabase = (url, key) => {
  if (url && key) {
    localStorage.setItem("sb_url", url);
    localStorage.setItem("sb_key", key);
    try {
      supabaseClient = createClient(url, key);
    } catch (e) {
      supabaseClient = null;
      throw e;
    }
  } else {
    localStorage.removeItem("sb_url");
    localStorage.removeItem("sb_key");
    supabaseClient = null;
  }
  return supabaseClient;
};
