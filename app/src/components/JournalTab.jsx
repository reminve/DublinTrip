import React, { useState, useEffect } from 'react';
import { getSupabase } from '../supabase';
import { Beer, Edit3, Trash2, Calendar, Smile, Compass, MapPin } from 'lucide-react';

export default function JournalTab({ userProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('pints'); // 'journal' | 'pints'
  
  // States for Journal
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryEmoji, setNewEntryEmoji] = useState('☘️');
  const [journalLoading, setJournalLoading] = useState(false);

  // States for Pints
  const [pints, setPints] = useState([]);
  const [pubName, setPubName] = useState('');
  const [pintPrice, setPintPrice] = useState('');
  const [pintRating, setPintRating] = useState(5);
  const [pintNote, setPintNote] = useState('');
  const [pintLoading, setPintLoading] = useState(false);

  const supabase = getSupabase();

  // Load Journal
  const loadJournal = async () => {
    setJournalLoading(true);
    let loadedEntries = [];
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dublin_journal')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          loadedEntries = data;
        } else {
          throw new Error(error?.message || "Table not found");
        }
      } catch (err) {
        // Fallback to localStorage
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
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dublin_pints')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          loadedPints = data;
        } else {
          throw new Error(error?.message || "Table not found");
        }
      } catch (err) {
        // Fallback to localStorage
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
  }, []);

  // Save Journal Entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntryText.trim()) return;

    const newEntry = {
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      content: newEntryText,
      emoji: newEntryEmoji,
      user_id: userProfile?.id || null
    };

    const updatedEntries = [newEntry, ...journalEntries];
    setJournalEntries(updatedEntries);
    setNewEntryText('');

    if (supabase) {
      try {
        const { error } = await supabase.from('dublin_journal').insert([
          { content: newEntry.content, emoji: newEntry.emoji }
        ]);
        if (error) throw error;
      } catch (err) {
        // Safe inside localStorage if db fails
        localStorage.setItem('dublin_journal_entries', JSON.stringify(updatedEntries));
      }
    } else {
      localStorage.setItem('dublin_journal_entries', JSON.stringify(updatedEntries));
    }
  };

  // Save Pint Entry
  const handleAddPint = async (e) => {
    e.preventDefault();
    if (!pubName.trim()) return;

    const newPint = {
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      pub: pubName,
      price: parseFloat(pintPrice) || 0,
      rating: parseInt(pintRating),
      note: pintNote,
      user_id: userProfile?.id || null
    };

    const updatedPints = [newPint, ...pints];
    setPints(updatedPints);
    setPubName('');
    setPintPrice('');
    setPintNote('');

    if (supabase) {
      try {
        const { error } = await supabase.from('dublin_pints').insert([
          { pub: newPint.pub, price: newPint.price, rating: newPint.rating, note: newPint.note }
        ]);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem('dublin_pints_list', JSON.stringify(updatedPints));
      }
    } else {
      localStorage.setItem('dublin_pints_list', JSON.stringify(updatedPints));
    }
  };

  // Delete Journal Entry
  const handleDeleteEntry = async (id) => {
    const updated = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updated);

    if (supabase) {
      try {
        await supabase.from('dublin_journal').delete().eq('id', id);
      } catch (err) {
        localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_journal_entries', JSON.stringify(updated));
    }
  };

  // Delete Pint Entry
  const handleDeletePint = async (id) => {
    const updated = pints.filter(pint => pint.id !== id);
    setPints(updated);

    if (supabase) {
      try {
        await supabase.from('dublin_pints').delete().eq('id', id);
      } catch (err) {
        localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_pints_list', JSON.stringify(updated));
    }
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
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="relative pl-6">
                    {/* Floating Bullet */}
                    <span className="absolute -left-4.5 top-0.5 w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-base shadow-md">
                      {entry.emoji}
                    </span>

                    {/* Entry Bubble */}
                    <div className="card-premium p-4 space-y-2 relative">
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
                    </div>
                  </div>
                ))}
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
                {pints.map((pint) => (
                  <div key={pint.id} className="card-premium p-4 flex gap-4 items-center justify-between">
                    
                    {/* Left Icon Panel */}
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-lg font-black">
                      🍺
                    </div>

                    {/* Content Panel */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-200 text-xs truncate">{pint.pub}</h4>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {'☘️'.repeat(pint.rating)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{pint.note || "Aucune note rédigée"}</p>
                      
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
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
