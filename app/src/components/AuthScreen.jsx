import React, { useState } from 'react';
import { ShieldCheck, LogIn, UserPlus, Settings } from 'lucide-react';
import { getSupabase } from '../supabase';

export default function AuthScreen({ onAuthenticated, onShowSetup }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Saisissez votre email et votre mot de passe.");
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setErrorMsg("Base de données non configurée.");
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Fetch User Profile Row
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          // Profile entry missing: create a draft via upsert (fallback)
          await supabase.from('profiles').upsert([
            { id: data.user.id, email: email, approved: false, is_admin: false }
          ]);
          await supabase.auth.signOut();
          setErrorMsg("Votre compte est en attente d'approbation par l'administrateur.");
        } else if (!profile.approved) {
          await supabase.auth.signOut();
          setErrorMsg("Votre compte est en attente d'approbation par l'administrateur.");
        } else {
          // Successful Login and Approved!
          onAuthenticated(profile);
        }
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data && data.user) {
          // The database trigger public.handle_new_user() automatically
          // creates the profile row. We don't need to manually insert it anymore.
          alert("Compte créé ! Veuillez patienter pendant que l'administrateur valide votre demande.");
          setAuthMode('login');
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Une erreur s'est produite lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6">
      <div className="w-full max-w-sm bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Logo & Title */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Dublin 2026</h1>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'login' ? "Accéder au Dashboard Sécurisé" : "Demander l'accès au Dashboard"}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-slate-950 border border-slate-850 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setAuthMode('login')} 
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${authMode === 'login' ? 'text-slate-100 bg-slate-900 border border-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Connexion
          </button>
          <button 
            type="button"
            onClick={() => setAuthMode('signup')} 
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${authMode === 'signup' ? 'text-slate-100 bg-slate-900 border border-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Créer un compte
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nom@exemple.com" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>
          
          {/* Error Message */}
          {errorMsg && (
            <p className="text-rose-400 text-xs font-medium text-center">{errorMsg}</p>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-600/50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? "Chargement..." : authMode === 'login' ? "Se connecter" : "Créer mon compte"}</span>
          </button>
        </form>

        {/* Database Config Trigger */}
        <div className="text-center border-t border-slate-850 pt-4 flex justify-between items-center text-[10px]">
          <span class="text-slate-500">Dublin 2026</span>
          <button 
            type="button"
            onClick={onShowSetup} 
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Settings className="w-3 h-3" /> Config Database
          </button>
        </div>
      </div>
    </div>
  );
}
