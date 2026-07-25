import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  const url = localStorage.getItem("sb_url");
  const key = localStorage.getItem("sb_key");
  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (e) {
      console.error("Failed to initialize Supabase client", e);
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
