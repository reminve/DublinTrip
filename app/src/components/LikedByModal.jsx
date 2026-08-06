import React from 'react';
import { Heart, X, User } from 'lucide-react';

export default function LikedByModal({ isOpen, onClose, likes = [], title = 'Mentions J\'aime' }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{title}</h3>
              <p className="text-[10px] text-slate-400">{likes.length} personne{likes.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User List */}
        <div className="p-3 overflow-y-auto divide-y divide-slate-800/40 space-y-1">
          {likes.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Aucun j'aime pour le moment.
            </div>
          ) : (
            likes.map((user, idx) => {
              const name = typeof user === 'string' ? user : (user?.name || user?.email || 'Voyageur');
              const initial = name.charAt(0).toUpperCase();

              return (
                <div key={idx} className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-800/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {initial}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{name.split('@')[0]}</p>
                      <p className="text-[10px] text-slate-400">{name.includes('@') ? name : 'Membre du voyage'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    Voyageur
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
