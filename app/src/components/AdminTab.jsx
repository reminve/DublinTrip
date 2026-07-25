import React, { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw, Database, Trash2 } from 'lucide-react';
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

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
      fetchProfiles();
    } catch (err) {
      alert("Erreur lors de la mise à jour des privilèges : " + err.message);
    }
  };

  // GPS history reset
  const handleResetGPS = async () => {
    if (!confirm("⚠️ ATTENTION : Voulez-vous supprimer l'INTEGRALITE de l'historique des positions GPS ? Cette action videra les tracés de la carte pour tous les voyageurs.")) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('dublin_gps')
          .delete()
          .neq('id', 0); // Deletes all rows
          
        if (error) throw error;
      }
      localStorage.removeItem('dublin_gps_points');
      alert("Historique GPS effacé avec succès. La carte est de nouveau propre et prête pour Dublin !");
    } catch (err) {
      alert("Erreur lors de la réinitialisation : " + err.message);
    }
  };

  // Journal reset
  const handleResetJournal = async () => {
    if (!confirm("⚠️ Voulez-vous supprimer tous les messages du Journal de bord ?")) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('dublin_journal')
          .delete()
          .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows
          
        if (error) throw error;
      }
      localStorage.removeItem('dublin_journal_entries');
      alert("Journal de bord réinitialisé !");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  // Guinness reset
  const handleResetGuinness = async () => {
    if (!confirm("⚠️ Voulez-vous réinitialiser le compteur de Guinness et supprimer tous les avis de pubs enregistrés ?")) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('dublin_pints')
          .delete()
          .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows
          
        if (error) throw error;
      }
      localStorage.removeItem('dublin_pints_list');
      alert("Compteur de Guinness réinitialisé à 0 !");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  // Expenses reset
  const handleResetExpenses = async () => {
    if (!confirm("⚠️ Voulez-vous supprimer TOUTES les dépenses enregistrées (y compris les 7 dépenses par défaut) de la base de données ?")) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('dublin_expenses')
          .delete()
          .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows
          
        if (error) throw error;
      }
      localStorage.removeItem('dublin_expenses_list');
      localStorage.removeItem('dublin_expenses_seeded');
      alert("Registre des dépenses réinitialisé avec succès !");
    } catch (err) {
      alert("Erreur lors du nettoyage des dépenses : " + err.message);
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
                        <span className="bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">Approuvé</span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-450 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold animate-pulse">En attente</span>
                      )}
                      {profile.is_admin && (
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-semibold ml-1">Admin</span>
                      )}
                    </div>
                    {profile.approved && (
                      <label className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.is_admin}
                          disabled={isSelf} // Prevent self demotion
                          onChange={() => toggleAdminStatus(profile.id, profile.is_admin)}
                          className="w-3 h-3 rounded border-slate-900 bg-slate-950 text-emerald-500 accent-emerald-500 cursor-pointer"
                        />
                        <span>Droits Administrateur</span>
                      </label>
                    )}
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
                        className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-455 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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

      {/* Database Maintenance panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4">
        <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Database className="w-4 h-4 text-emerald-400" /> Maintenance des Données
        </h3>
        <p className="text-xs text-slate-400 leading-normal">
          Utilisez ces actions pour nettoyer les données de test (GPS ou bières) avant de décoller pour Dublin afin de démarrer votre voyage sur une base vierge.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            onClick={handleResetGPS}
            className="bg-slate-950 hover:bg-rose-500/10 border border-slate-900 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 font-bold p-4 rounded-2xl text-xs transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center animate-duration-100"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <p className="font-extrabold">Effacer Historique GPS</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Vider la carte en direct</p>
            </div>
          </button>

          <button
            onClick={handleResetJournal}
            className="bg-slate-950 hover:bg-rose-500/10 border border-slate-900 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 font-bold p-4 rounded-2xl text-xs transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <p className="font-extrabold">Réinitialiser Journal</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Vider les billets du blog</p>
            </div>
          </button>

          <button
            onClick={handleResetGuinness}
            className="bg-slate-950 hover:bg-rose-500/10 border border-slate-900 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 font-bold p-4 rounded-2xl text-xs transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <p className="font-extrabold">Remettre Guinness à 0</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Réinitialiser le compteur</p>
            </div>
          </button>

          <button
            onClick={handleResetExpenses}
            className="bg-slate-950 hover:bg-rose-500/10 border border-slate-900 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 font-bold p-4 rounded-2xl text-xs transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <p className="font-extrabold">Vider le Budget</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Réinitialiser le registre</p>
            </div>
          </button>
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
