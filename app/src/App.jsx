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
          // Profile entry missing: create it (not approved by default)
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ id: session.user.id, email: session.user.email, approved: false, is_admin: false }])
            .select()
            .single();
            
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
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 overflow-x-hidden min-h-screen">
      
      {/* Top Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">☘️</span>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Dublin 2026</h2>
            <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{userProfile?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3.5 py-1.5 shadow-md backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Cloud Live</span>
        </div>
      </header>

      {/* Main Panels */}
      <main>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'itinerary' && <ItineraryTab />}
        {activeTab === 'gallery' && <GalleryTab userProfile={userProfile} />}
        {activeTab === 'tracking' && <TrackingTab userProfile={userProfile} />}
        
        {/* Combined 5th Tab based on admin status */}
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

      {/* Bottom Navigation (5 items max on mobile screens) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 py-3 px-4 z-40 max-w-md mx-auto rounded-t-2xl shadow-2xl">
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
