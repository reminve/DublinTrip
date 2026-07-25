import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, Camera, MapPin, Users, Settings, 
  Sun, Moon, Sparkles, BookOpen, Compass, Beer, 
  CheckSquare, Plus, Palette, LogOut, MessageSquare, FileText, Plane
} from 'lucide-react';
import { getSupabase } from './supabase';
import SetupScreen from './components/SetupScreen';
import AuthScreen from './components/AuthScreen';
import DashboardTab from './components/DashboardTab';
import ItineraryTab from './components/ItineraryTab';
import GalleryTab from './components/GalleryTab';
import TrackingTab from './components/TrackingTab';
import JournalTab from './components/JournalTab';
import ToolsTab from './components/ToolsTab';
import DocumentsTab from './components/DocumentsTab';
import TransportTab from './components/TransportTab';
import AdminTab from './components/AdminTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [screen, setScreen] = useState('loading'); // 'loading', 'setup', 'auth', 'app'
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Customization Themes & Accents
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('app-accent') || 'emerald');

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
          // Profile entry missing: create it via insert
          await supabase
            .from('profiles')
            .insert([{ id: session.user.id, email: session.user.email, approved: false, is_admin: false }]);
            
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
    } catch (err) {
      setScreen('auth');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Theme configuration effect
  useEffect(() => {
    const body = document.body;
    body.classList.remove('light');
    
    let activeTheme = theme;
    if (theme === 'auto') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = systemDark ? 'dark' : 'light';
    }
    
    if (activeTheme === 'light') {
      body.classList.add('light');
    }
    
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Accent color configuration effect
  useEffect(() => {
    const body = document.body;
    const rgbColors = {
      emerald: '16 185 129',
      amber: '245 158 11',
      orange: '249 115 22',
      sky: '14 165 233',
      indigo: '99 102 241'
    };
    const colorVal = rgbColors[accent] || '16 185 129';
    body.style.setProperty('--accent-color', colorVal);
    
    // Manage class modifiers
    body.className = body.className.replace(/\baccent-\S+/g, '');
    body.classList.add(`accent-${accent}`);
    
    localStorage.setItem('app-accent', accent);
  }, [accent]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserProfile(null);
    setScreen('auth');
    setActiveTab('dashboard');
  };

  const getActiveStyle = (tabId) => {
    if (activeTab !== tabId) return {};
    const isLight = theme === 'light' || (theme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
    const darkColors = {
      emerald: '#047857',
      amber: '#b45309',
      orange: '#c2410c',
      sky: '#0369a1',
      indigo: '#4338ca'
    };
    const textCol = isLight ? (darkColors[accent] || '#047857') : 'rgb(var(--accent-color))';
    return { 
      backgroundColor: 'rgba(var(--accent-color), 0.1)', 
      color: textCol,
      border: '1px solid rgba(var(--accent-color), 0.25)'
    };
  };

  const getActiveTextStyle = (tabId) => {
    if (activeTab !== tabId) return {};
    const isLight = theme === 'light' || (theme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
    const darkColors = {
      emerald: '#047857',
      amber: '#b45309',
      orange: '#c2410c',
      sky: '#0369a1',
      indigo: '#4338ca'
    };
    const textCol = isLight ? (darkColors[accent] || '#047857') : 'rgb(var(--accent-color))';
    return { color: textCol };
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

  // Common UI Color Switcher
  const ColorSwitcher = () => {
    const colors = [
      { id: 'emerald', hex: '#10b981', label: 'Vert Trèfle' },
      { id: 'amber', hex: '#f59e0b', label: 'Jaune Or' },
      { id: 'orange', hex: '#f97316', label: 'Orange Sunset' },
      { id: 'sky', hex: '#0ea5e9', label: 'Bleu Ciel' },
      { id: 'indigo', hex: '#6366f1', label: 'Bleu Celtique' }
    ];
    return (
      <div className="flex gap-2 items-center justify-center md:justify-start">
        {colors.map(col => (
          <button
            key={col.id}
            type="button"
            onClick={() => setAccent(col.id)}
            className="w-5.5 h-5.5 rounded-full border border-slate-950/20 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            style={{ 
              backgroundColor: col.hex, 
              boxShadow: accent === col.id ? `0 0 10px ${col.hex}` : 'none',
              borderWidth: accent === col.id ? '2px' : '1px',
              borderColor: accent === col.id ? '#ffffff' : 'rgba(255,255,255,0.1)'
            }}
            title={col.label}
          />
        ))}
      </div>
    );
  };

  // Common UI Theme Switcher
  const ThemeSwitcher = () => (
    <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 items-center gap-1 w-fit shadow-inner">
      <button 
        type="button" 
        onClick={() => setTheme('light')} 
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'light' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}
        title="Mode Clair"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button 
        type="button" 
        onClick={() => setTheme('dark')} 
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-indigo-500 text-slate-200 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}
        title="Mode Sombre"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button 
        type="button" 
        onClick={() => setTheme('auto')} 
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'auto' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}
        title="Thème Auto"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row relative overflow-x-hidden">
      
      {/* Aesthetic blur background elements */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* ==================== LEFT SIDEBAR (DESKTOP ONLY) ==================== */}
      <aside className="hidden md:flex w-64 bg-slate-900/10 border-r border-slate-900/60 p-6 flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-30">
        <div className="space-y-6">
          
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Cloud Synchronisé</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 overflow-y-auto max-h-[65vh] scrollbar-none">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'dashboard' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('dashboard')}
            >
              <Home className="w-5 h-5" />
              <span>Voyage</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('itinerary')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'itinerary' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('itinerary')}
            >
              <Calendar className="w-5 h-5" />
              <span>Feuille de Route</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('journal')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'journal' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('journal')}
            >
              <Beer className="w-5 h-5" />
              <span>Journal & Pubs</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('gallery')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'gallery' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('gallery')}
            >
              <Camera className="w-5 h-5" />
              <span>Album Photos</span>
            </button>

            <button 
              onClick={() => setActiveTab('documents')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'documents' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('documents')}
            >
              <FileText className="w-5 h-5" />
              <span>Billets & Résas</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('tracking')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'tracking' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('tracking')}
            >
              <MapPin className="w-5 h-5" />
              <span>Suivi GPS Live</span>
            </button>

            <button 
              onClick={() => setActiveTab('transport')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'transport' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('transport')}
            >
              <Plane className="w-5 h-5" />
              <span>Vols &amp; Transports</span>
            </button>

            <button 
              onClick={() => setActiveTab('tools')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'tools' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('tools')}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Outils & Défis</span>
            </button>

            {userProfile?.is_admin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'admin' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
                style={getActiveStyle('admin')}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span>Admin Accès</span>
                </div>
                {pendingApprovals > 0 && (
                  <span className="bg-rose-500 text-slate-50 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {pendingApprovals}
                  </span>
                )}
              </button>
            )}

            {userProfile?.is_admin && (
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'settings' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
                style={getActiveStyle('settings')}
              >
                <Settings className="w-4 h-4" />
                <span>Réglages</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer Customizer */}
        <div className="space-y-4 pt-4 border-t border-slate-900/60">
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Palette className="w-3 h-3" /> Couleur d'accent</p>
            <ColorSwitcher />
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Sun className="w-3 h-3" /> Thème Visuel</p>
            <ThemeSwitcher />
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-900 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 text-slate-400 hover:text-rose-455 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ==================== HEADER (MOBILE ONLY) ==================== */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-900/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-35">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">☘️</span>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Dublin 2026</h2>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">{userProfile?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 shadow-md backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </header>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full z-10">
        <main className="pb-20 md:pb-0">
          {activeTab === 'dashboard' && <DashboardTab userProfile={userProfile} />}
          {activeTab === 'itinerary' && <ItineraryTab />}
          {activeTab === 'journal' && <JournalTab userProfile={userProfile} />}
          {activeTab === 'gallery' && <GalleryTab userProfile={userProfile} />}
          {activeTab === 'tracking' && <TrackingTab userProfile={userProfile} />}
          {activeTab === 'transport' && <TransportTab />}
          {activeTab === 'tools' && <ToolsTab userProfile={userProfile} />}
          {activeTab === 'documents' && <DocumentsTab userProfile={userProfile} />}
          {activeTab === 'admin' && userProfile?.is_admin && (
            <AdminTab 
              userProfile={userProfile} 
              onProfileStatusChanged={setPendingApprovals} 
            />
          )}
          {activeTab === 'settings' && userProfile?.is_admin && (
            <SettingsTab 
              onLogout={handleLogout} 
              onShowSetup={() => setScreen('setup')} 
            />
          )}
        </main>
      </div>

      {/* ==================== BOTTOM TAB BAR (MOBILE ONLY) ==================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900/50 py-3 px-4 z-40 max-w-md mx-auto rounded-t-2xl shadow-2xl">
        <div className="grid grid-cols-5 text-center">
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setShowPlusMenu(false); }} 
            className="flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-500"
            style={getActiveTextStyle('dashboard')}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Voyage</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('itinerary'); setShowPlusMenu(false); }} 
            className="flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-500"
            style={getActiveTextStyle('itinerary')}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Feuille</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('journal'); setShowPlusMenu(false); }} 
            className="flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-500"
            style={getActiveTextStyle('journal')}
          >
            <Beer className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Journal</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('gallery'); setShowPlusMenu(false); }} 
            className="flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-500"
            style={getActiveTextStyle('gallery')}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Album</span>
          </button>
          
          <button 
            onClick={() => setShowPlusMenu(prev => !prev)} 
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${showPlusMenu ? 'text-slate-200' : 'text-slate-500'}`}
            style={['tracking', 'transport', 'tools', 'documents', 'admin', 'settings'].includes(activeTab) && !showPlusMenu ? { color: 'rgb(var(--accent-color))' } : {}}
          >
            <Plus className={`w-5 h-5 transition-transform duration-300 ${showPlusMenu ? 'rotate-45 text-rose-400' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{showPlusMenu ? "Fermer" : "Plus"}</span>
          </button>

        </div>
      </nav>

      {/* ==================== MOBILE "PLUS" MENU OVERLAY ==================== */}
      {showPlusMenu && (
        <div 
          onClick={() => setShowPlusMenu(false)}
          className="md:hidden fixed inset-0 z-45 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 transition-all"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 pb-24 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><Compass className="w-4 h-4 text-emerald-400" /> Autres outils</h3>
              <button 
                onClick={() => setShowPlusMenu(false)}
                className="text-xs text-slate-500 font-bold hover:text-slate-350"
              >
                Fermer
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                onClick={() => { setActiveTab('tracking'); setShowPlusMenu(false); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all text-center cursor-pointer gap-2"
              >
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase text-slate-300">Suivi GPS</span>
              </button>

              <button 
                onClick={() => { setActiveTab('transport'); setShowPlusMenu(false); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all text-center cursor-pointer gap-2"
              >
                <Plane className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase text-slate-300">Vols &amp; Trains</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('tools'); setShowPlusMenu(false); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all text-center cursor-pointer gap-2"
              >
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase text-slate-300">Checklists & Défis</span>
              </button>

              <button 
                onClick={() => { setActiveTab('documents'); setShowPlusMenu(false); }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all text-center cursor-pointer gap-2 ${!userProfile?.is_admin ? 'col-span-2' : ''}`}
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase text-slate-300">Billets & Résas</span>
              </button>

              {userProfile?.is_admin && (
                <button 
                  onClick={() => { setActiveTab('settings'); setShowPlusMenu(false); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all text-center cursor-pointer gap-2"
                >
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-300">Réglages</span>
                </button>
              )}

              {userProfile?.is_admin && (
                <button 
                  onClick={() => { setActiveTab('admin'); setShowPlusMenu(false); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 transition-all text-center cursor-pointer relative gap-2 col-span-2"
                >
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-300">Admin</span>
                  {pendingApprovals > 0 && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-slate-50 text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                      {pendingApprovals}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Customizers inside Plus Menu */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center flex items-center justify-center gap-1.5"><Palette className="w-3 h-3" /> Couleur d'accent</p>
                <ColorSwitcher />
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5"><Sun className="w-3 h-3" /> Thème Visuel</p>
                <ThemeSwitcher />
              </div>
              
              <button 
                onClick={() => { handleLogout(); setShowPlusMenu(false); }}
                className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
