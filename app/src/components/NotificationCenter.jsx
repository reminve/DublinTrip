import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageSquare, X, Check, Beer, Image, BookOpen } from 'lucide-react';

export function sendNotification({ type, author, text, itemTitle }) {
  const newNotif = {
    id: Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    type, // 'like' | 'comment'
    author: author || 'Un voyageur',
    text: text || '',
    itemTitle: itemTitle || 'un contenu',
    created_at: new Date().toISOString(),
    read: false
  };

  const raw = localStorage.getItem('dublin_notifications');
  const list = raw ? JSON.parse(raw) : [];
  const updated = [newNotif, ...list].slice(0, 50); // Keep 50 recent
  localStorage.setItem('dublin_notifications', JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('app-new-notification', { detail: newNotif }));
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);

  const loadNotifications = () => {
    const raw = localStorage.getItem('dublin_notifications');
    if (raw) setNotifications(JSON.parse(raw));
  };

  useEffect(() => {
    loadNotifications();

    const handleNewNotif = (e) => {
      const notif = e.detail;
      setActiveToast(notif);
      loadNotifications();
      setTimeout(() => {
        setActiveToast(prev => prev?.id === notif.id ? null : prev);
      }, 4000);
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
      {/* Toast Banner (Top Right Floating) */}
      {activeToast && (
        <div 
          onClick={() => { setIsOpen(true); setActiveToast(null); }}
          className="fixed top-4 right-4 z-50 bg-slate-900 border border-emerald-500/40 text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer animate-in slide-in-from-top-3 fade-in duration-300 max-w-xs sm:max-w-sm"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${activeToast.type === 'like' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {activeToast.type === 'like' ? <Heart className="w-5 h-5 fill-rose-500" /> : <MessageSquare className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">
              {activeToast.author.split('@')[0]} {activeToast.type === 'like' ? 'a liké' : 'a commenté'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {activeToast.type === 'like' ? activeToast.itemTitle : `"${activeToast.text}"`}
            </p>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}
            className="text-slate-500 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Notification Bell Icon Trigger */}
      <button 
        type="button"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
        className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/50"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end p-2 sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm h-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col my-auto animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Notifications du Voyage</h3>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button 
                    type="button" 
                    onClick={clearAll} 
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-medium"
                  >
                    Effacer
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-800/40 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs">Aucune notification pour le moment.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="py-3 px-2 flex items-start gap-3 hover:bg-slate-800/30 rounded-xl transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${n.type === 'like' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {n.type === 'like' ? <Heart className="w-4 h-4 fill-rose-500" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200">
                        <span className="font-bold text-emerald-400">{n.author.split('@')[0]}</span> {n.type === 'like' ? 'a aimé' : 'a commenté'} <span className="font-medium text-slate-300">{n.itemTitle}</span>
                      </p>
                      {n.text && <p className="text-xs italic text-slate-400 mt-1 bg-slate-800/50 p-2 rounded-lg border border-slate-800">"{n.text}"</p>}
                      <p className="text-[9px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
