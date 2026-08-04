import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, Camera, MapPin, Users, Settings, 
  Sun, Moon, Sparkles, Beer, 
  CheckSquare, Plus, Palette, LogOut, FileText, Plane,
  Download, Wifi, WifiOff, RefreshCw, Smartphone, X, Check
} from 'lucide-react';
import { getSupabase } from './supabase';
import { isOnline, getOfflineQueue, syncOfflineQueue } from './offlineSync';
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
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('app-active-tab') || 'dashboard');
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Persist active tab during current browser session (cleared when closing tab/app)
  useEffect(() => {
    if (activeTab) {
      sessionStorage.setItem('app-active-tab', activeTab);
    }
  }, [activeTab]);

  // Customization Themes & Accents
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('app-accent') || 'emerald');

  // PWA & Offline States
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const [onlineState, setOnlineState] = useState(isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(() => getOfflineQueue().length);
  const [syncToast, setSyncToast] = useState({ show: false, message: '' });

  // Listen to PWA install prompt & offline sync events
  useEffect(() => {
    // 1. Capture PWA Install prompt on Android/Chrome
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // 2. Network & Sync Event Listeners
    const handleNetworkChange = (e) => {
      const online = e.detail?.online ?? isOnline();
      setOnlineState(online);
    };

    const handleQueueChange = (e) => {
      const q = e.detail?.queue || getOfflineQueue();
      setQueueCount(q.length);
    };

    const handleSyncStart = () => {
      setIsSyncing(true);
    };

    const handleSyncComplete = (e) => {
      setIsSyncing(false);
      const count = e.detail?.syncedCount || 0;
      if (count > 0) {
        setSyncToast({
          show: true,
          message: `📶 ${count} modification(s) synchronisée(s) avec succès sur le Cloud !`
        });
        setTimeout(() => setSyncToast({ show: false, message: '' }), 4000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('network-status-changed', handleNetworkChange);
    window.addEventListener('offline-queue-changed', handleQueueChange);
    window.addEventListener('offline-sync-start', handleSyncStart);
    window.addEventListener('offline-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('network-status-changed', handleNetworkChange);
      window.removeEventListener('offline-queue-changed', handleQueueChange);
      window.removeEventListener('offline-sync-start', handleSyncStart);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, []);

  const handleInstallPWA = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Utilisateur a accepté l\'installation');
        }
        setInstallPrompt(null);
      });
    } else {
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIos) {
        setShowIosModal(true);
      } else {
        alert("Pour installer l'application sur mobile :\n1. Ouvrez le menu de votre navigateur (⋮ ou Partager).\n2. Appuyez sur 'Ajouter à l'écran d'accueil'.");
      }
    }
  };

  const handleForceSync = async () => {
    if (!onlineState) {
      alert("Vous êtes actuellement hors-ligne. La synchronisation s'effectuera dès que vous retrouverez de la connexion.");
      return;
    }
    setIsSyncing(true);
    const res = await syncOfflineQueue();
    setIsSyncing(false);
    if (res.syncedCount > 0) {
      alert(`✅ Synchronisation terminée : ${res.syncedCount} élément(s) envoyés sur le Cloud !`);
    } else if (res.remaining === 0) {
      alert("✅ Toutes vos données sont déjà parfaitement synchronisées sur le Cloud !");
    }
  };

  // Check auth session on mount/setup updates
  const checkSession = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setScreen('setup');
      return;
    }

    const cachedProfileRaw = localStorage.getItem('dublin_cached_profile');
    const cachedProfile = cachedProfileRaw ? JSON.parse(cachedProfileRaw) : null;

    // Fast path: if offline and cached profile exists, open app immediately
    if (!isOnline() && cachedProfile) {
      setUserProfile(cachedProfile);
      setScreen('app');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.user) {
        if (isOnline()) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && profile) {
            if (!profile.approved) {
              await supabase.auth.signOut();
              localStorage.removeItem('dublin_cached_profile');
              setUserProfile(null);
              setScreen('auth');
            } else {
              localStorage.setItem('dublin_cached_profile', JSON.stringify(profile));
              setUserProfile(profile);
              setScreen('app');
            }
            return;
          }
        }

        // Offline or network error fallback
        if (cachedProfile) {
          setUserProfile(cachedProfile);
          setScreen('app');
        } else {
          const fallback = {
            id: session.user.id,
            email: session.user.email,
            approved: true,
            is_admin: true
          };
          localStorage.setItem('dublin_cached_profile', JSON.stringify(fallback));
          setUserProfile(fallback);
          setScreen('app');
        }
      } else {
        if (!isOnline() && cachedProfile) {
          setUserProfile(cachedProfile);
          setScreen('app');
        } else {
          setScreen('auth');
        }
      }
    } catch (err) {
      if (cachedProfile) {
        setUserProfile(cachedProfile);
        setScreen('app');
      } else {
        setScreen('auth');
      }
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
    
    body.className = body.className.replace(/\baccent-\S+/g, '');
    body.classList.add(`accent-${accent}`);
    
    localStorage.setItem('app-accent', accent);
  }, [accent]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('dublin_cached_profile');
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
      backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(var(--accent-color), 0.15)',
      color: textCol,
      boxShadow: isLight ? 'none' : 'inset 0 0 12px rgba(var(--accent-color), 0.1)'
    };
  };

  const getActiveTextStyle = (tabId) => {
    if (activeTab !== tabId) return { color: '#64748b' };
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

      {/* Sync Toast Notification */}
      {syncToast.show && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* iOS PWA Install Modal */}
      {showIosModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-3xl">📱</span>
              <div>
                <h3 className="font-extrabold text-white text-base">Installer sur iPhone</h3>
                <p className="text-xs text-slate-400">Dublin 2026 — Mode Hors-ligne</p>
              </div>
            </div>

            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <li>Appuyez sur le bouton <strong className="text-emerald-400">Partager ⎋</strong> en bas de Safari.</li>
              <li>Faites défiler le menu et sélectionnez <strong className="text-emerald-400">'Sur l'écran d'accueil' ➕</strong>.</li>
              <li>Appuyez sur <strong className="text-emerald-400">Ajouter</strong> en haut à droite.</li>
            </ol>

            <p className="text-[11px] text-slate-400 italic text-center">
              L'application sera accessible sans connexion depuis votre écran d'accueil !
            </p>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
            >
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* ==================== LEFT SIDEBAR (DESKTOP ONLY - FIXED) ==================== */}
      <aside className="hidden md:flex fixed top-0 left-0 w-64 h-screen bg-slate-900/10 border-r border-slate-900/60 p-6 flex-col justify-between backdrop-blur-xl z-30">
        <div className="space-y-5">
          
          {/* Sidebar Header */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">☘️</span>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Dublin 2026</h2>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{userProfile?.email}</p>
            </div>
          </div>

          {/* Sync & Network status indicator */}
          <div 
            onClick={handleForceSync}
            className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 cursor-pointer hover:border-slate-700 transition-colors"
            title="Cliquer pour forcer la synchronisation Cloud"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />
              ) : !onlineState ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              ) : queueCount > 0 ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin flex-shrink-0" />
              ) : (
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider truncate">
                {isSyncing ? 'Synchro Cloud...' : !onlineState ? `Hors-Ligne (${queueCount})` : queueCount > 0 ? `Synchro (${queueCount})` : 'Cloud Synchro'}
              </span>
            </div>
          </div>

          {/* Install PWA Button (Desktop & Mobile) */}
          <button
            onClick={handleInstallPWA}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Installer l'App PWA</span>
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[48vh] scrollbar-none">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'dashboard' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('dashboard')}
            >
              <Home className="w-4 h-4" />
              <span>Voyage</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('itinerary')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'itinerary' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('itinerary')}
            >
              <Calendar className="w-4 h-4" />
              <span>Feuille de Route</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('journal')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'journal' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('journal')}
            >
              <Beer className="w-4 h-4" />
              <span>Journal & Pubs</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('gallery')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'gallery' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('gallery')}
            >
              <Camera className="w-4 h-4" />
              <span>Album Photos</span>
            </button>

            <button 
              onClick={() => setActiveTab('documents')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'documents' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('documents')}
            >
              <FileText className="w-4 h-4" />
              <span>Billets & Résas</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('tracking')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'tracking' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('tracking')}
            >
              <MapPin className="w-4 h-4" />
              <span>Suivi GPS Live</span>
            </button>

            <button 
              onClick={() => setActiveTab('transport')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'transport' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('transport')}
            >
              <Plane className="w-4 h-4" />
              <span>Vols &amp; Transports</span>
            </button>

            <button 
              onClick={() => setActiveTab('tools')} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'tools' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
              style={getActiveStyle('tools')}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Outils & Défis</span>
            </button>

            {userProfile?.is_admin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'admin' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
                style={getActiveStyle('admin')}
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
            )}

            {userProfile?.is_admin && (
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'settings' ? '' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'}`}
                style={getActiveStyle('settings')}
              >
                <Settings className="w-4 h-4" />
                <span>Réglages</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer Customizer */}
        <div className="space-y-3 pt-3 border-t border-slate-900/60">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Palette className="w-3 h-3" /> Couleur d'accent</p>
            <ColorSwitcher />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Sun className="w-3 h-3" /> Thème Visuel</p>
            <ThemeSwitcher />
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-900 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 text-slate-400 hover:text-rose-455 font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallPWA}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
            title="Installer l'App"
          >
            <Smartphone className="w-3 h-3" /> App
          </button>

          <div 
            onClick={handleForceSync}
            className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1 shadow-sm backdrop-blur cursor-pointer"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
            ) : !onlineState ? (
              <WifiOff className="w-3 h-3 text-amber-500" />
            ) : (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            )}
            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {!onlineState ? `Hors-Ligne (${queueCount})` : 'Live'}
            </span>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="flex-1 md:ml-64 min-h-screen flex justify-center p-4 md:p-8 w-full z-10">
        <main className="w-full max-w-5xl pb-20 md:pb-0">
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
            <span className="text-[9px] font-bold uppercase tracking-wider">Plan</span>
          </button>

          <button 
            onClick={() => setShowPlusMenu(!showPlusMenu)} 
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-slate-950 transition-transform active:scale-95">
              <Plus className={`w-6 h-6 transition-transform duration-300 ${showPlusMenu ? 'rotate-45' : ''}`} />
            </div>
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
            <span className="text-[9px] font-bold uppercase tracking-wider">Photos</span>
          </button>

        </div>

        {/* Plus Mobile Menu Modal Overlay */}
        {showPlusMenu && (
          <div className="absolute bottom-20 left-4 right-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-3 gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
            <button 
              onClick={() => { setActiveTab('documents'); setShowPlusMenu(false); }}
              className="flex flex-col items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-300"
            >
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-center">Billets & Résas</span>
            </button>
            <button 
              onClick={() => { setActiveTab('tracking'); setShowPlusMenu(false); }}
              className="flex flex-col items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-300"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-center">GPS Live</span>
            </button>
            <button 
              onClick={() => { setActiveTab('transport'); setShowPlusMenu(false); }}
              className="flex flex-col items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-300"
            >
              <Plane className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-center">Transports</span>
            </button>
            <button 
              onClick={() => { setActiveTab('tools'); setShowPlusMenu(false); }}
              className="flex flex-col items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-300"
            >
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-center">Outils & Défis</span>
            </button>
            {userProfile?.is_admin && (
              <button 
                onClick={() => { setActiveTab('admin'); setShowPlusMenu(false); }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-300"
              >
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold text-center">Admin</span>
              </button>
            )}
            {userProfile?.is_admin && (
              <button 
                onClick={() => { setActiveTab('settings'); setShowPlusMenu(false); }}
                className="flex flex-col items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-300"
              >
                <Settings className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold text-center">Réglages</span>
              </button>
            )}
          </div>
        )}
      </nav>

    </div>
  );
}
