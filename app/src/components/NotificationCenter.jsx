import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Heart, MessageSquare, X, Check, Beer, Image, BookOpen, Sparkles } from 'lucide-react';

export function sendNotification({ type, author, text, itemTitle }) {
  const newNotif = {
    id: Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type, // 'like' | 'comment'
    author: author || 'Un voyageur',
    text: text || '',
    itemTitle: itemTitle || 'un contenu',
    created_at: new Date().toISOString(),
    read: false
  };

  try {
    const raw = localStorage.getItem('dublin_notifications');
    const list = raw ? JSON.parse(raw) : [];
    const updated = [newNotif, ...list].slice(0, 60);
    localStorage.setItem('dublin_notifications', JSON.stringify(updated));
  } catch (e) {
    console.warn("Storage notif error:", e);
  }

  // Trigger sound/vibration on mobile
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([80, 40, 80]); } catch (e) {}
  }

  window.dispatchEvent(new CustomEvent('app-new-notification', { detail: newNotif }));
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);

  const loadNotifications = () => {
    try {
      const raw = localStorage.getItem('dublin_notifications');
      if (raw) setNotifications(JSON.parse(raw));
    } catch (e) {}
  };

  useEffect(() => {
    loadNotifications();

    const handleNewNotif = (e) => {
      const notif = e.detail;
      setActiveToast(notif);
      loadNotifications();
      setTimeout(() => {
        setActiveToast(prev => prev?.id === notif.id ? null : prev);
      }, 5000);
    };

    window.addEventListener('app-new-notification', handleNewNotif);
    return () => window.removeEventListener('app-new-notification', handleNewNotif);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('dublin_notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('dublin_notifications');
  };

  return (
    <>
      {/* Header Notification Bell Icon Trigger - High Contrast Light & Dark */}
      <button 
        type="button"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
        className="relative p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-slate-700/50 shadow-sm active:scale-95"
        title="Centre de Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Toast Notification via Portal (Directly on document.body to prevent clipping) */}
      {activeToast && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => { setIsOpen(true); setActiveToast(null); }}
          className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[99999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500 text-slate-900 dark:text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer animate-in slide-in-from-top-3 fade-in duration-300 max-w-sm sm:max-w-md mx-auto sm:mx-0 ring-4 ring-emerald-500/10"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${activeToast.type === 'like' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
            {activeToast.type === 'like' ? <Heart className="w-5 h-5 fill-rose-500" /> : <MessageSquare className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Nouvelle activité
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {activeToast.author.split('@')[0]} {activeToast.type === 'like' ? 'a aimé' : 'a commenté'}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
              {activeToast.type === 'like' ? activeToast.itemTitle : `"${activeToast.text}"`}
            </p>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}

      {/* Notifications Drawer Modal via Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm flex justify-end p-2 sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm h-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col my-auto animate-in slide-in-from-right duration-250 text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Activités, likes & commentaires en direct</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button 
                    type="button" 
                    onClick={clearAll} 
                    className="text-[10px] text-slate-400 hover:text-rose-500 font-bold px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                  >
                    Effacer
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/40 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aucune notification pour le moment</p>
                  <p className="text-[11px]">Les nouveaux likes et commentaires s'afficheront ici.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="py-3 px-2 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${n.type === 'like' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                      {n.type === 'like' ? <Heart className="w-4 h-4 fill-rose-500" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{n.author.split('@')[0]}</span> {n.type === 'like' ? 'a aimé' : 'a commenté'} <span className="font-semibold text-slate-900 dark:text-slate-100">{n.itemTitle}</span>
                      </p>
                      {n.text && (
                        <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-1 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          "{n.text}"
                        </p>
                      )}
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                        {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
