import React, { useState, useEffect } from 'react';
import { Home, Calendar, Camera, MapPin, Users, Settings } from 'lucide-react';
import { getSupabase } from './supabase';
import SetupScreen from './components/SetupScreen';
import AuthScreen from './components/AuthScreen';
import DashboardTab from './components/DashboardTab';
import ItineraryTab from './components/ItineraryTab';
import GalleryTab from './components/GalleryTab';
import TrackingTab from './components/TrackingTab';
import AdminTab from './components/AdminTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [screen, setScreen] = useState('loading'); // 'loading', 'setup', 'auth', 'app'
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // Check auth session on mount/setup updates
  const checkSession = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setScreen('setup');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          // Profile entry missing: create it via upsert (fallback)
          await supabase
            .from('profiles')
            .upsert([{ id: session.user.id, email: session.user.email, approved: false, is_admin: false }]);
            
          await supabase.auth.signOut();
          setUserProfile(null);
          setScreen('auth');
          alert("Votre compte a été enregistré. Veuillez attendre l'approbation de l'administrateur.");
        } else if (!profile.approved) {
          await supabase.auth.signOut();
          setUserProfile(null);
          setScreen('auth');
        } else {
          // Session is active and approved!
          setUserProfile(profile);
          setScreen('app');
        }
      } else {
        setScreen('auth');
      }
    } catch (e) {
      setScreen('auth');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserProfile(null);
    setScreen('auth');
    setActiveTab('dashboard');
  };

  if (screen === 'loading') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
        <span className="text-4xl animate-bounce">☘️</span>
        <p className="text-xs text-slate-500 font-bold uppercase mt-4 tracking-widest animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (screen === 'setup') {
    return <SetupScreen onConfigSaved={checkSession} />;
  }

  if (screen === 'auth') {
    return <AuthScreen onAuthenticated={checkSession} onShowSetup={() => setScreen('setup')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row relative overflow-x-hidden">
      
      {/* Aesthetic blur background elements */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* ==================== LEFT SIDEBAR (DESKTOP ONLY) ==================== */}
      <aside className="hidden md:flex w-64 bg-slate-900/20 border-r border-slate-900/60 p-6 flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-30">
        <div className="space-y-8">
          
          {/* Sidebar Header */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">☘️</span>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Dublin 2026</h2>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{userProfile?.email}</p>
            </div>
          </div>

          {/* Sync status indicator */}
          <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Cloud Synchronisé</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
            >
              <Home className="w-4 h-4" />
              <span>Voyage</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('itinerary')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'itinerary' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Feuille de Route</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('gallery')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'gallery' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
            >
              <Camera className="w-4 h-4" />
              <span>Album Photos</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('tracking')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'tracking' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
            >
              <MapPin className="w-4 h-4" />
              <span>Suivi GPS Live</span>
            </button>

            {userProfile?.is_admin ? (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Admin Accès</span>
                </div>
                {pendingApprovals > 0 && (
                  <span className="bg-rose-500 text-slate-50 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {pendingApprovals}
                  </span>
                )}
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Réglages</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer (Logout) */}
        <div>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-900 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ==================== HEADER (MOBILE ONLY) ==================== */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-900/60 bg-slate-950/60 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">☘️</span>
          <div>
            <h2 className="text-base font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Dublin 2026</h2>
            <p className="text-[9px] text-slate-500 font-mono tracking-wider overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">{userProfile?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 shadow-md backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Cloud Live</span>
        </div>
      </header>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full z-10">
        <main className="pb-16 md:pb-0">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'itinerary' && <ItineraryTab />}
          {activeTab === 'gallery' && <GalleryTab userProfile={userProfile} />}
          {activeTab === 'tracking' && <TrackingTab userProfile={userProfile} />}
          
          {activeTab === 'admin' && userProfile?.is_admin && (
            <AdminTab 
              userProfile={userProfile} 
              onProfileStatusChanged={setPendingApprovals} 
            />
          )}
          {activeTab === 'settings' && !userProfile?.is_admin && (
            <SettingsTab 
              onLogout={handleLogout} 
              onShowSetup={() => setScreen('setup')} 
            />
          )}
        </main>
      </div>

      {/* ==================== BOTTOM TAB BAR (MOBILE ONLY) ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 py-3 px-4 z-40 max-w-md mx-auto rounded-t-2xl shadow-2xl">
        <div className="grid grid-cols-5 text-center">
          
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Voyage</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('itinerary')} 
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'itinerary' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Feuille</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('gallery')} 
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'gallery' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Album</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tracking')} 
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'tracking' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Suivi</span>
          </button>

          {/* Conditional 5th Tab */}
          {userProfile?.is_admin ? (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`flex flex-col items-center gap-1.5 transition-all relative cursor-pointer ${activeTab === 'admin' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Admin</span>
              {pendingApprovals > 0 && (
                <span className="absolute -top-1 right-5 bg-rose-500 text-slate-50 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingApprovals}
                </span>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'settings' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Réglages</span>
            </button>
          )}

        </div>
      </nav>

    </div>
  );
}
