import React, { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw } from 'lucide-react';
import { getSupabase } from '../supabase';

export default function AdminTab({ userProfile, onProfileStatusChanged }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabase();

  const fetchProfiles = async () => {
    if (!supabase || !userProfile.is_admin) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProfiles(data);
      
      // Update pending badge in the parent
      const pendingCount = data.filter(p => !p.approved).length;
      if (onProfileStatusChanged) {
        onProfileStatusChanged(pendingCount);
      }
    } catch (err) {
      console.error("Error loading profiles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const approveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId);
        
      if (error) throw error;
      fetchProfiles();
    } catch (err) {
      alert("Erreur lors de l'approbation : " + err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Voulez-vous supprimer ce profil ?")) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      fetchProfiles();
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* User list */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Gestion des Accès
          </h3>
          <button 
            onClick={fetchProfiles} 
            disabled={loading}
            className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-3">
          {profiles.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Aucun compte trouvé.</p>
          ) : (
            profiles.map(profile => {
              const isSelf = profile.id === userProfile.id;
              return (
                <div key={profile.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-200">{profile.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {profile.approved ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">Approuvé</span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold animate-pulse">En attente</span>
                      )}
                      {profile.is_admin && (
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-semibold ml-1">Admin</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!profile.approved && (
                      <button 
                        onClick={() => approveUser(profile.id)} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Approuver
                      </button>
                    )}
                    {!isSelf && (
                      <button 
                        onClick={() => deleteUser(profile.id)} 
                        className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SQL Promotion guide */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" /> Rôle Administrateur
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pour des raisons de sécurité, le premier compte (le vôtre) doit être promu Administrateur en exécutant la commande suivante dans l'éditeur SQL de votre console Supabase :
        </p>
        <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-3 text-[10px] font-mono text-slate-350 select-all">
          UPDATE public.profiles <br />
          SET approved = true, is_admin = true <br />
          WHERE email = '{userProfile?.email || 'votre-email@exemple.com'}';
        </div>
      </div>

    </div>
  );
}
