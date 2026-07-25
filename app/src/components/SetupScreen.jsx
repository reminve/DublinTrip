import React, { useState } from 'react';
import { Database, Save } from 'lucide-react';
import { resetSupabase } from '../supabase';

export default function SetupScreen({ onConfigSaved }) {
  const [url, setUrl] = useState(localStorage.getItem('sb_url') || '');
  const [key, setKey] = useState(localStorage.getItem('sb_key') || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      alert("Veuillez saisir l'URL et la clé.");
      return;
    }
    setLoading(true);
    try {
      resetSupabase(url.trim(), key.trim());
      onConfigSaved();
    } catch (err) {
      alert("Configuration invalide: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Database className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Liaison Supabase requise</h1>
          <p className="text-xs text-slate-400 mt-2">Pour sécuriser vos comptes et synchroniser vos données gratuitement, liez votre projet Supabase.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Supabase URL</label>
            <input 
              type="text" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://xxxx.supabase.co" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Anon Key (Clé API)</label>
            <input 
              type="password" 
              value={key} 
              onChange={e => setKey(e.target.value)} 
              placeholder="eyJhbGciOi..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-600/50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> 
            {loading ? "Liaison en cours..." : "Lier la base de données"}
          </button>
        </div>
        
        <div className="text-center text-[10px] text-slate-500">
          Pas encore de projet ? Créez-en un gratuit sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline text-emerald-400">supabase.com</a>
        </div>
      </form>
    </div>
  );
}
