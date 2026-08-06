import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getSupabase } from '../supabase';
import { isOnline, addToOfflineQueue } from '../offlineSync';
import { 
  Beer, Edit3, Trash2, Calendar, Smile, Compass, MapPin, 
  Heart, MessageSquare, Send, Camera, Image as ImageIcon, X, ZoomIn
} from 'lucide-react';
import CameraModal from './CameraModal';
import LikedByModal from './LikedByModal';
import { sendNotification } from './NotificationCenter';

// Image compression helper
const compressImage = (file, maxSize = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function JournalTab({ userProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('pints'); // 'journal' | 'pints'
  
  // Current user identifier
  const currentUser = userProfile?.email || userProfile?.full_name || 'Voyageur';

  // States for Journal
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryEmoji, setNewEntryEmoji] = useState('☘️');
  const [newEntryPhoto, setNewEntryPhoto] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);

  // States for Pints
  const [pints, setPints] = useState([]);
  const [pubName, setPubName] = useState('');
  const [pintPrice, setPintPrice] = useState('');
  const [pintRating, setPintRating] = useState(5);
  const [pintNote, setPintNote] = useState('');
  const [newPintPhoto, setNewPintPhoto] = useState(null);
  const [pintLoading, setPintLoading] = useState(false);

  // Expanded comments state: { [postId]: boolean }
  const [expandedComments, setExpandedComments] = useState({});
  // Comment inputs: { [postId]: { text: string, photo: string|null } }
  const [commentInputs, setCommentInputs] = useState({});

  // Lightbox state for photo preview
  const [lightboxImage, setLightboxImage] = useState(null);

  // Camera modal state: 'journal' | 'pint' | null
  const [cameraTarget, setCameraTarget] = useState(null);
  
  // Instagram-style LikedBy modal state
  const [likedByModalState, setLikedByModalState] = useState({ isOpen: false, likes: [], title: '' });

  const supabase = getSupabase();

  // Load Journal
  const loadJournal = async () => {
    setJournalLoading(true);
    let loadedEntries = [];
    
    if (supabase && isOnline()) {
      try {
        const { data, error } = await supabase
          .from('dublin_journal')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          loadedEntries = data.map(e => ({
            ...e,
            likes: Array.isArray(e.likes) ? e.likes : (typeof e.likes === 'string' && e.likes.startsWith('[') ? JSON.parse(e.likes) : []),
            comments: Array.isArray(e.comments) ? e.comments : (typeof e.comments === 'string' && e.comments.startsWith('[') ? JSON.parse(e.comments) : [])
          }));
          localStorage.setItem('dublin_journal_entries', JSON.stringify(loadedEntries));
        } else {
          console.warn("[Journal] DB load error:", error?.message);
        }
      } catch (err) {
        console.warn("[Journal] Exception loading DB journal:", err);
        const local = localStorage.getItem('dublin_journal_entries');
        if (local) loadedEntries = JSON.parse(local);
      }
    } else {
      const local = localStorage.getItem('dublin_journal_entries');
      if (local) loadedEntries = JSON.parse(local);
    }
    
    setJournalEntries(loadedEntries);
    setJournalLoading(false);
  };

  // Load Pints
  const loadPints = async () => {
    setPintLoading(true);
    let loadedPints = [];
    
    if (supabase && isOnline()) {
      try {
        const { data, error } = await supabase
          .from('dublin_pints')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          loadedPints = data.map(p => ({
            ...p,
            likes: Array.isArray(p.likes) ? p.likes : (typeof p.likes === 'string' && p.likes.startsWith('[') ? JSON.parse(p.likes) : []),
            comments: Array.isArray(p.comments) ? p.comments : (typeof p.comments === 'string' && p.comments.startsWith('[') ? JSON.parse(p.comments) : [])
          }));
          localStorage.setItem('dublin_pints_list', JSON.stringify(loadedPints));
        } else {
          console.warn("[Pints] DB load error:", error?.message);
        }
      } catch (err) {
        console.warn("[Pints] Exception loading DB pints:", err);
        const local = localStorage.getItem('dublin_pints_list');
        if (local) loadedPints = JSON.parse(local);
      }
    } else {
      const local = localStorage.getItem('dublin_pints_list');
      if (local) loadedPints = JSON.parse(local);
    }

    setPints(loadedPints);
    setPintLoading(false);
  };

  useEffect(() => {
    loadJournal();
    loadPints();

    let channelJournal = null;
    let channelPints = null;

    if (supabase) {
      channelJournal = supabase
        .channel('public_dublin_journal')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dublin_journal' }, () => {
          loadJournal();
        })
        .subscribe();

      channelPints = supabase
        .channel('public_dublin_pints')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dublin_pints' }, () => {
          loadPints();
        })
        .subscribe();
    }

    const handleSyncComplete = () => {
      loadJournal();
      loadPints();
    };
    window.addEventListener('offline-sync-complete', handleSyncComplete);
    return () => {
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
      if (channelJournal) supabase.removeChannel(channelJournal);
      if (channelPints) supabase.removeChannel(channelPints);
    };
  }, []);

  // Save Journal Entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntryText.trim()) return;

    const newEntry = {
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      content: newEntryText,
      emoji: newEntryEmoji,
      photo: newEntryPhoto,
      likes: [],
      comments: [],
      user_id: userProfile?.id || null
    };

    setJournalEntries(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
      return updated;
    });
    setNewEntryText('');
    setNewEntryPhoto(null);

    const payload = { content: newEntry.content, emoji: newEntry.emoji, photo: newEntry.photo };

    if (supabase && isOnline()) {
      try {
        const { data, error } = await supabase.from('dublin_journal').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]?.id) {
          const realId = data[0].id;
          setJournalEntries(prev => {
            const updated = prev.map(item => String(item.id) === String(newEntry.id) ? { ...item, id: realId } : item);
            localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        addToOfflineQueue({ type: 'INSERT', table: 'dublin_journal', data: payload });
      }
    } else {
      addToOfflineQueue({ type: 'INSERT', table: 'dublin_journal', data: payload });
    }
  };

  // Save Pint Entry
  const handleAddPint = async (e) => {
    e.preventDefault();
    if (!pubName.trim()) return;

    const newPint = {
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      pub: pubName,
      price: parseFloat(pintPrice) || 0,
      rating: parseInt(pintRating),
      note: pintNote,
      photo: newPintPhoto,
      likes: [],
      comments: [],
      user_id: userProfile?.id || null
    };

    setPints(prev => {
      const updated = [newPint, ...prev];
      localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
      return updated;
    });
    setPubName('');
    setPintPrice('');
    setPintNote('');
    setNewPintPhoto(null);

    const payload = { pub: newPint.pub, price: newPint.price, rating: newPint.rating, note: newPint.note, photo: newPint.photo };

    if (supabase && isOnline()) {
      try {
        const { data, error } = await supabase.from('dublin_pints').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]?.id) {
          const realId = data[0].id;
          setPints(prev => {
            const updated = prev.map(item => String(item.id) === String(newPint.id) ? { ...item, id: realId } : item);
            localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        addToOfflineQueue({ type: 'INSERT', table: 'dublin_pints', data: payload });
      }
    } else {
      addToOfflineQueue({ type: 'INSERT', table: 'dublin_pints', data: payload });
    }

    // Notify Dashboard to include new pint in expenses
    window.dispatchEvent(new CustomEvent('pints-updated'));
  };

  // Delete Journal Entry
  const handleDeleteEntry = async (id) => {
    const updated = journalEntries.filter(entry => String(entry.id) !== String(id));
    setJournalEntries(updated);
    localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));

    if (supabase && isOnline() && !String(id).startsWith('off_')) {
      try {
        await supabase.from('dublin_journal').delete().eq('id', id);
      } catch (err) {
        addToOfflineQueue({ type: 'DELETE', table: 'dublin_journal', data: { id } });
      }
    } else {
      addToOfflineQueue({ type: 'DELETE', table: 'dublin_journal', data: { id } });
    }
  };

  // Delete Pint Entry
  const handleDeletePint = async (id) => {
    const updated = pints.filter(pint => String(pint.id) !== String(id));
    setPints(updated);
    localStorage.setItem('dublin_pints_list', JSON.stringify(updated));

    if (supabase && isOnline() && !String(id).startsWith('off_')) {
      try {
        await supabase.from('dublin_pints').delete().eq('id', id);
      } catch (err) {
        addToOfflineQueue({ type: 'DELETE', table: 'dublin_pints', data: { id } });
      }
    } else {
      addToOfflineQueue({ type: 'DELETE', table: 'dublin_pints', data: { id } });
    }

    // Notify Dashboard to update expenses
    window.dispatchEvent(new CustomEvent('pints-updated'));
  };

  // Like / Unlike Toggle for Journal or Pint
  const handleToggleLike = async (id, type) => {
    const list = type === 'journal' ? journalEntries : pints;
    let targetItem = null;

    const updated = list.map(item => {
      if (String(item.id) === String(id)) {
        const likes = Array.isArray(item.likes) ? item.likes : [];
        const hasLiked = likes.includes(currentUser);
        const newLikes = hasLiked ? likes.filter(u => u !== currentUser) : [...likes, currentUser];
        targetItem = { ...item, likes: newLikes };
        return targetItem;
      }
      return item;
    });

    if (type === 'journal') {
      setJournalEntries(updated);
      localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
    } else {
      setPints(updated);
      localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
    }

    if (targetItem) {
      sendNotification({
        type: 'like',
        author: currentUser,
        itemTitle: type === 'journal' ? (targetItem.content ? `"${targetItem.content.substring(0, 20)}..."` : 'un billet') : `la pinte à ${targetItem.pub}`
      });
    }

    if (supabase && isOnline() && targetItem && !String(targetItem.id).startsWith('off_')) {
      const table = type === 'journal' ? 'dublin_journal' : 'dublin_pints';
      try {
        const { error } = await supabase.from(table).update({ likes: targetItem.likes }).eq('id', targetItem.id);
        if (error) console.warn("DB like update warning:", error.message);
      } catch (err) {
        console.warn("DB like update error:", err);
      }
    }
  };

  // Add Comment to Post
  const handleAddComment = async (postId, type) => {
    const key = String(postId);
    const rawVal = commentInputs[key] || commentInputs[postId];
    const text = typeof rawVal === 'string' ? rawVal : (rawVal?.text || '');
    if (!text.trim()) return;

    const newComment = {
      id: Math.random().toString(36).substring(2),
      author: userProfile?.full_name || currentUser.split('@')[0] || 'Voyageur',
      authorEmail: currentUser,
      content: text.trim(),
      created_at: new Date().toISOString()
    };

    const list = type === 'journal' ? journalEntries : pints;
    let targetItem = null;

    const updated = list.map(item => {
      if (String(item.id) === String(postId)) {
        const currentComments = Array.isArray(item.comments) ? item.comments : [];
        targetItem = { ...item, comments: [...currentComments, newComment] };
        return targetItem;
      }
      return item;
    });

    if (type === 'journal') {
      setJournalEntries(updated);
      localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
    } else {
      setPints(updated);
      localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
    }

    if (targetItem) {
      sendNotification({
        type: 'comment',
        author: currentUser,
        text,
        itemTitle: type === 'journal' ? (targetItem.content ? `"${targetItem.content.substring(0, 20)}..."` : 'un billet') : `la pinte à ${targetItem.pub}`
      });
    }

    // Reset comment input state for this post
    setCommentInputs(prev => ({ ...prev, [postId]: { text: '', photo: null } }));

    if (supabase && isOnline() && targetItem && !String(targetItem.id).startsWith('off_')) {
      const table = type === 'journal' ? 'dublin_journal' : 'dublin_pints';
      try {
        const { error } = await supabase.from(table).update({ comments: targetItem.comments }).eq('id', targetItem.id);
        if (error) console.warn("DB comment update warning:", error.message);
      } catch (err) {
        console.warn("DB comment update error:", err);
      }
    }
  };

  // Delete Comment from Post
  const handleDeleteComment = async (postId, commentId, type) => {
    const list = type === 'journal' ? journalEntries : pints;
    let targetItem = null;

    const updated = list.map(item => {
      if (String(item.id) === String(postId)) {
        const filtered = (item.comments || []).filter(c => c.id !== commentId);
        targetItem = { ...item, comments: filtered };
        return targetItem;
      }
      return item;
    });

    if (type === 'journal') {
      setJournalEntries(updated);
      localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
    } else {
      setPints(updated);
      localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
    }

    if (supabase && isOnline() && targetItem && !String(targetItem.id).startsWith('off_')) {
      const table = type === 'journal' ? 'dublin_journal' : 'dublin_pints';
      try {
        const { error } = await supabase.from(table).update({ comments: targetItem.comments }).eq('id', targetItem.id);
        if (error) console.warn("DB comment delete warning:", error.message);
      } catch (err) {
        console.warn("DB comment delete error:", err);
      }
    }
  };

  // File upload handler helper
  const handlePhotoSelect = async (e, setPhotoState) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 900, 0.75);
      setPhotoState(base64);
    } catch (err) {
      alert("Erreur lors de la compression de la photo.");
    }
  };

  // Toggle comments expand
  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs */}
      <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-900/60 max-w-sm">
        <button
          onClick={() => setActiveSubTab('pints')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'pints' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Beer className="w-3.5 h-3.5" />
          <span>Guinness Tracker</span>
        </button>
        <button
          onClick={() => setActiveSubTab('journal')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'journal' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Carnet de Bord</span>
        </button>
      </div>

      {/* ==================== SUB TAB: CARNET DE BORD ==================== */}
      {activeSubTab === 'journal' && (
        <div className="space-y-6">
          
          {/* Cover Photo */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 shadow-lg h-32">
            <img 
              src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80" 
              alt="Dublin street illustration" 
              className="w-full h-full object-cover brightness-[0.7]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-overlay-white text-base font-extrabold text-slate-50 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" /> Le Journal de Route
              </h3>
              <p className="text-overlay-muted text-[10px] text-slate-400">Micro-anecdotes partagées en direct d'Irlande</p>
            </div>
          </div>

          {/* Add Entry Form (Admin Only) */}
          {userProfile?.is_admin && (
            <form onSubmit={handleAddEntry} className="card-premium p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" /> Rédiger une note de voyage
              </h4>
              
              <div className="flex gap-2">
                <select 
                  value={newEntryEmoji}
                  onChange={(e) => setNewEntryEmoji(e.target.value)}
                  className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 text-lg cursor-pointer"
                >
                  <option>☘️</option><option>✈️</option><option>🌦️</option><option>🍺</option><option>🏰</option>
                  <option>😋</option><option>😴</option><option>🎒</option><option>🗺️</option><option>🎶</option>
                </select>
                
                <input 
                  type="text"
                  placeholder="Qu'avez-vous visité aujourd'hui ?"
                  value={newEntryText}
                  onChange={(e) => setNewEntryText(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              {/* Photo Upload Row */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Joindre une photo au souvenir</label>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Direct Mobile Camera Input */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-900 hover:border-emerald-500/40 rounded-xl text-[10px] font-bold text-slate-300 cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Appareil photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoSelect(e, setNewEntryPhoto)}
                      className="hidden"
                    />
                  </label>

                  {/* WebRTC Live Camera Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setCameraTarget('journal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-bold hover:bg-emerald-500/20 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Caméra Live</span>
                  </button>

                  {/* Gallery Input */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:border-slate-800 cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Galerie</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, setNewEntryPhoto)}
                      className="hidden"
                    />
                  </label>

                  {newEntryPhoto && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-emerald-500/50 group ml-1">
                      <img src={newEntryPhoto} alt="Aperçu" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewEntryPhoto(null)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                Partager
              </button>
            </form>
          )}

          {/* Journal Entries List */}
          <div className="space-y-4">
            {journalLoading ? (
              <p className="text-center py-6 text-xs text-slate-500 animate-pulse">Chargement des billets...</p>
            ) : journalEntries.length === 0 ? (
              <div className="text-center py-10 text-slate-500 card-premium p-6">
                <Smile className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-xs font-semibold">Le carnet est vide. En attente de l'arrivée à Dublin !</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-800/80 ml-6 space-y-6">
                {journalEntries.map((entry) => {
                  const likes = Array.isArray(entry.likes) ? entry.likes : [];
                  const comments = Array.isArray(entry.comments) ? entry.comments : [];
                  const isLiked = likes.includes(currentUser);
                  const showComments = !!expandedComments[entry.id];
                  const cInput = commentInputs[String(entry.id)] || commentInputs[entry.id] || { text: '', photo: null };

                  return (
                    <div key={entry.id} className="relative pl-6">
                      {/* Floating Bullet */}
                      <span className="absolute -left-4.5 top-0.5 w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-base shadow-md">
                        {entry.emoji}
                      </span>

                      {/* Entry Bubble */}
                      <div className="card-premium p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          
                          {userProfile?.is_admin && (
                            <button 
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-200 leading-relaxed">{entry.content}</p>

                        {/* Entry Photo if available */}
                        {entry.photo && (
                          <div 
                            onClick={() => setLightboxImage(entry.photo)}
                            className="relative rounded-xl overflow-hidden border border-slate-800 max-h-60 cursor-pointer group"
                          >
                            <img src={entry.photo} alt="Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          </div>
                        )}

                        {/* Actions Row: Likes & Comments */}
                        <div className="flex items-center gap-4 pt-2 border-t border-slate-900/60 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(entry.id, 'journal')}
                            className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                              isLiked ? 'text-rose-400 scale-105' : 'text-slate-400 hover:text-rose-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                            <span>{likes.length}</span>
                          </button>

                          {likes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setLikedByModalState({ isOpen: true, likes, title: 'Mentions J\'aime (Journal)' })}
                              className="text-[9px] text-slate-400 hover:text-emerald-400 underline cursor-pointer"
                            >
                              Voir qui a aimé
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleComments(entry.id)}
                            className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{comments.length} commentaire{comments.length > 1 ? 's' : ''}</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {showComments && (
                          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-900/80">
                            {/* Comments List */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {comments.length === 0 ? (
                                <p className="text-[9px] text-slate-500 italic">Aucun commentaire pour l'instant. Soyez le premier !</p>
                              ) : (
                                comments.map(comment => (
                                  <div key={comment.id} className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-xl p-2.5 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{comment.author}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-slate-500">
                                          {new Date(comment.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {(userProfile?.is_admin || comment.authorEmail === currentUser) && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteComment(entry.id, comment.id, 'journal')}
                                            className="text-slate-400 hover:text-rose-400 cursor-pointer"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {comment.content && <p className="text-[10px] text-slate-800 dark:text-slate-200 font-medium leading-normal">{comment.content}</p>}
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add Comment Input */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Ajouter un commentaire..."
                                value={typeof cInput === 'string' ? cInput : (cInput?.text || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCommentInputs(prev => ({ ...prev, [String(entry.id)]: val, [entry.id]: val }));
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(entry.id, 'journal'); }}
                                className="flex-grow bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 py-1.5 text-[10px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 font-medium"
                              />

                              <button
                                type="button"
                                onClick={() => handleAddComment(entry.id, 'journal')}
                                className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer flex-shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB: GUINNESS TRACKER ==================== */}
      {activeSubTab === 'pints' && (
        <div className="space-y-6">
          
          {/* Pint Hero Header */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 shadow-lg h-32">
            <img 
              src="https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=800&q=80" 
              alt="Guinness pint illustration" 
              className="w-full h-full object-cover brightness-[0.6]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-center justify-between p-5">
              <div>
                <h3 className="text-overlay-white text-base font-extrabold text-slate-50 flex items-center gap-2">
                  <Beer className="w-4.5 h-4.5 text-amber-500 animate-bounce" /> Guinness & Pub Counter
                </h3>
                <p className="text-overlay-muted text-[10px] text-slate-400">Le tableau de chasse des pubs dublinois</p>
              </div>
              <div className="bg-amber-500 text-slate-950 rounded-2xl w-14 h-14 flex flex-col items-center justify-center shadow-lg border border-amber-400">
                <span className="text-xl font-black leading-none">{pints.length}</span>
                <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">Pintes</span>
              </div>
            </div>
          </div>

          {/* Add Pint Form (Admin Only) */}
          {userProfile?.is_admin && (
            <form onSubmit={handleAddPint} className="card-premium p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Beer className="w-4 h-4 text-amber-500" /> Logger une nouvelle dégustation
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nom du Pub / Bar</label>
                  <input 
                    type="text"
                    placeholder="Ex: Temple Bar, The Brazen Head..."
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Prix de la pinte (€)</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="Ex: 6.80"
                    value={pintPrice}
                    onChange={(e) => setPintPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Note (Shamrocks ☘️)</label>
                  <select 
                    value={pintRating}
                    onChange={(e) => setPintRating(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (Très bon)</option>
                    <option value={3}>⭐⭐⭐ (Moyen)</option>
                    <option value={2}>⭐⭐ (Bof)</option>
                    <option value={1}>⭐ (À éviter)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Petit avis / Note de dégustation</label>
                <input 
                  type="text"
                  placeholder="Ex: Ambiance traditionnelle incroyable, mousse parfaite."
                  value={pintNote}
                  onChange={(e) => setPintNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Photo Upload Row for Pint */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Photo de la pinte / du pub</label>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Direct Mobile Camera */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-900 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-slate-300 cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span>Appareil photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoSelect(e, setNewPintPhoto)}
                      className="hidden"
                    />
                  </label>

                  {/* WebRTC Live Camera Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setCameraTarget('pint')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-bold hover:bg-amber-500/20 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Caméra Live</span>
                  </button>

                  {/* Gallery Input */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:border-slate-800 cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Galerie</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, setNewPintPhoto)}
                      className="hidden"
                    />
                  </label>

                  {newPintPhoto && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-amber-500/50 group ml-1">
                      <img src={newPintPhoto} alt="Aperçu pinte" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewPintPhoto(null)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Ajouter au Guinness Tracker
              </button>
            </form>
          )}

          {/* Pints list */}
          <div className="space-y-4">
            {pintLoading ? (
              <p className="text-center py-6 text-xs text-slate-500 animate-pulse">Chargement du tracker...</p>
            ) : pints.length === 0 ? (
              <div className="text-center py-10 text-slate-500 card-premium p-6">
                <Beer className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-xs font-semibold">Aucune pinte loggée pour l'instant. Que le voyage commence !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {pints.map((pint) => {
                  const likes = Array.isArray(pint.likes) ? pint.likes : [];
                  const comments = Array.isArray(pint.comments) ? pint.comments : [];
                  const isLiked = likes.includes(currentUser);
                  const showComments = !!expandedComments[pint.id];
                  const cInput = commentInputs[String(pint.id)] || commentInputs[pint.id] || { text: '', photo: null };

                  return (
                    <div key={pint.id} className="card-premium p-4 space-y-3">
                      <div className="flex gap-4 items-start justify-between">
                        
                        {/* Left Icon Panel / Photo */}
                        {pint.photo ? (
                          <div 
                            onClick={() => setLightboxImage(pint.photo)}
                            className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/30 flex-shrink-0 cursor-pointer group"
                          >
                            <img src={pint.photo} alt={pint.pub} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-lg font-black">
                            🍺
                          </div>
                        )}

                        {/* Content Panel */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-200 text-xs truncate">{pint.pub}</h4>
                            <span className="text-[10px] text-amber-400 font-bold">
                              {'☘️'.repeat(pint.rating)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{pint.note || "Aucune note rédigée"}</p>
                          
                          {/* Price and Date */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {new Date(pint.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                            {pint.price > 0 && (
                              <span className="text-[9px] font-bold text-emerald-400">{pint.price.toFixed(2)} €</span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        {userProfile?.is_admin && (
                          <button 
                            onClick={() => handleDeletePint(pint.id)}
                            className="text-slate-700 hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Actions Row: Likes & Comments */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-900/60 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(pint.id, 'pints')}
                          className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                            isLiked ? 'text-rose-400 scale-105' : 'text-slate-400 hover:text-rose-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{likes.length}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleComments(pint.id)}
                          className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{comments.length} commentaire{comments.length > 1 ? 's' : ''}</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments && (
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-900/80">
                          {/* Comments List */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {comments.length === 0 ? (
                              <p className="text-[9px] text-slate-500 italic">Aucun commentaire pour l'instant. Soyez le premier !</p>
                            ) : (
                              comments.map(comment => (
                                <div key={comment.id} className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-xl p-2.5 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">{comment.author}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[8px] text-slate-500">
                                        {new Date(comment.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {(userProfile?.is_admin || comment.authorEmail === currentUser) && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(pint.id, comment.id, 'pints')}
                                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {comment.content && <p className="text-[10px] text-slate-800 dark:text-slate-200 font-medium leading-normal">{comment.content}</p>}
                                </div>
                              ))
                            )}
                          </div>

                            {/* Add Comment Input */}
                             <div className="flex items-center gap-2 pt-1">
                               <input
                                 type="text"
                                 placeholder="Ajouter un commentaire sur ce pub..."
                                 value={typeof cInput === 'string' ? cInput : (cInput?.text || '')}
                                 onChange={(e) => {
                                   const val = e.target.value;
                                   setCommentInputs(prev => ({ ...prev, [String(pint.id)]: val, [pint.id]: val }));
                                 }}
                                 onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(pint.id, 'pints'); }}
                                 className="flex-grow bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 py-1.5 text-[10px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 font-medium"
                               />

                              <button
                                type="button"
                                onClick={() => handleAddComment(pint.id, 'pints')}
                                className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer flex-shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Lightbox Modal (Portal) */}
      {lightboxImage && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img src={lightboxImage} alt="Agrandissement" className="w-full h-full object-contain rounded-2xl border border-slate-800 shadow-2xl" />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* LikedBy Modal (Instagram style) */}
      <LikedByModal 
        isOpen={likedByModalState.isOpen} 
        onClose={() => setLikedByModalState({ isOpen: false, likes: [], title: '' })} 
        likes={likedByModalState.likes} 
        title={likedByModalState.title} 
      />

      {/* Camera Modal */}
      <CameraModal 
        isOpen={!!cameraTarget} 
        onClose={() => setCameraTarget(null)} 
        onCapture={(base64) => {
          if (cameraTarget === 'journal') setNewEntryPhoto(base64);
          if (cameraTarget === 'pint') setNewPintPhoto(base64);
          setCameraTarget(null);
        }} 
      />
    </div>
  );
}
