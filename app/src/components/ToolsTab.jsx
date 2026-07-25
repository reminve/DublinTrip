import React, { useState, useEffect } from 'react';
import { getSupabase } from '../supabase';
import { CheckSquare, MessageSquare, BookOpen, AlertCircle, Trash2, CheckCircle, Send, Globe } from 'lucide-react';

const SLANG_DATA = [
  { word: "Craic", definition: "Le fun, l'ambiance, les potins. 'What's the craic?' signifie 'Comment ça va ?/Quoi de neuf ?'. Avoir du 'good craic' signifie passer un super moment.", example: "Let's go to the pub for some good craic!" },
  { word: "Grand", definition: "Très courant pour dire que tout va bien, que c'est correct, ou d'accord. Ce n'est pas grandiose, juste 'très bien'.", example: "'How are you?' - 'I'm grand, thanks!'" },
  { word: "Sláinte", definition: "Prononcé 'Slan-cha', c'est le mot gaélique irlandais pour trinquer. Signifie littéralement 'Santé !'.", example: "Raise your pint of Guinness and say: Sláinte!" },
  { word: "Gaff", definition: "Une maison ou un appartement. 'Free gaff' signifie une maison vide pour faire la fête.", example: "He's over at his gaff watching the rugby match." },
  { word: "Chancer", definition: "Quelqu'un qui prend des risques, un beau parleur ou un profiteur qui tente sa chance.", example: "Don't believe him, he's just a chancer." },
  { word: "Deadly", definition: "Signifie 'génial', 'fantastique', 'excellent' (très populaire chez les Dublinois).", example: "That concert last night was absolutely deadly!" },
  { word: "Fair play!", definition: "Félicitations, bien joué ! Utilisé pour exprimer son respect ou son approbation.", example: "Fair play to you for passing that exam!" }
];

const DEFAULT_PACKING_LIST = [
  { id: 'p1', text: "Passeport / Carte d'identité", checked: false },
  { id: 'p2', text: "Adaptateur prise électrique Type G (UK/Irlande)", checked: false },
  { id: 'p3', text: "Imperméable léger / K-Way (météo changeante)", checked: false },
  { id: 'p4', text: "Batterie externe portable pour le GPS", checked: false },
  { id: 'p5', text: "Billet d'avion Aer Lingus imprimé ou sur mobile", checked: false },
  { id: 'p6', text: "Vêtements chauds (pulls / sweats pour les soirées)", checked: false },
  { id: 'p7', text: "Chaussures de marche confortables", checked: false }
];

const DEFAULT_CHECKOUT_LIST = [
  { id: 'c1', text: "Déposer les clés dans la Key Drop Box (boîte de retour réception)", checked: false },
  { id: 'c2', text: "Vérifier sous le lit et dans la douche (chargeur, vêtements)", checked: false },
  { id: 'c3', text: "Vider la poubelle de la chambre", checked: false },
  { id: 'c4', text: "Fermer les fenêtres et éteindre les lumières", checked: false },
  { id: 'c5', text: "Garder le passeport et le billet retour à portée de main", checked: false }
];

export default function ToolsTab({ userProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('checklists'); // 'checklists' | 'slang' | 'suggestions'
  const [activeChecklist, setActiveChecklist] = useState('packing'); // 'packing' | 'checkout'
  
  // Lists States
  const [packingList, setPackingList] = useState([]);
  const [checkoutList, setCheckoutList] = useState([]);

  // Slang accordion state
  const [openSlangIndex, setOpenSlangIndex] = useState(null);

  // Suggestions States
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestionText, setNewSuggestionText] = useState('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const supabase = getSupabase();

  // Load Checklists from LocalStorage
  useEffect(() => {
    const localPacking = localStorage.getItem('dublin_packing_list');
    if (localPacking) {
      setPackingList(JSON.parse(localPacking));
    } else {
      setPackingList(DEFAULT_PACKING_LIST);
    }

    const localCheckout = localStorage.getItem('dublin_checkout_list');
    if (localCheckout) {
      setCheckoutList(JSON.parse(localCheckout));
    } else {
      setCheckoutList(DEFAULT_CHECKOUT_LIST);
    }

    loadSuggestions();
  }, []);

  // Save checklists
  const togglePackingItem = (id) => {
    const updated = packingList.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setPackingList(updated);
    localStorage.setItem('dublin_packing_list', JSON.stringify(updated));
  };

  const toggleCheckoutItem = (id) => {
    const updated = checkoutList.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setCheckoutList(updated);
    localStorage.setItem('dublin_checkout_list', JSON.stringify(updated));
  };

  // Load Suggestions
  const loadSuggestions = async () => {
    setSuggestionsLoading(true);
    let loaded = [];
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dublin_suggestions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          loaded = data;
        } else {
          throw new Error(error?.message || "Table not found");
        }
      } catch (err) {
        const local = localStorage.getItem('dublin_suggestions_list');
        if (local) loaded = JSON.parse(local);
      }
    } else {
      const local = localStorage.getItem('dublin_suggestions_list');
      if (local) loaded = JSON.parse(local);
    }

    setSuggestions(loaded);
    setSuggestionsLoading(false);
  };

  // Submit Suggestion/Challenge
  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    if (!newSuggestionText.trim()) return;

    const newSugg = {
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      text: newSuggestionText,
      submitted_by: userProfile?.email || "Anonyme",
      completed: false,
      user_id: userProfile?.id || null
    };

    const updated = [newSugg, ...suggestions];
    setSuggestions(updated);
    setNewSuggestionText('');

    if (supabase) {
      try {
        const { error } = await supabase.from('dublin_suggestions').insert([
          { text: newSugg.text, submitted_by: newSugg.submitted_by, completed: false }
        ]);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem('dublin_suggestions_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_suggestions_list', JSON.stringify(updated));
    }
  };

  // Mark suggestion as completed (Admin only)
  const handleToggleComplete = async (id, currentStatus) => {
    const updated = suggestions.map(s => s.id === id ? { ...s, completed: !currentStatus } : s);
    setSuggestions(updated);

    if (supabase) {
      try {
        await supabase.from('dublin_suggestions').update({ completed: !currentStatus }).eq('id', id);
      } catch (err) {
        localStorage.setItem('dublin_suggestions_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_suggestions_list', JSON.stringify(updated));
    }
  };

  // Delete Suggestion
  const handleDeleteSuggestion = async (id) => {
    const updated = suggestions.filter(s => s.id !== id);
    setSuggestions(updated);

    if (supabase) {
      try {
        await supabase.from('dublin_suggestions').delete().eq('id', id);
      } catch (err) {
        localStorage.setItem('dublin_suggestions_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_suggestions_list', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs */}
      <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-900/60 max-w-md">
        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${activeSubTab === 'checklists' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Valise & Check-out</span>
        </button>
        <button
          onClick={() => setActiveSubTab('slang')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${activeSubTab === 'slang' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Argot Irlandais</span>
        </button>
        <button
          onClick={() => setActiveSubTab('suggestions')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${activeSubTab === 'suggestions' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Suggestions</span>
        </button>
      </div>

      {/* ==================== SUB TAB: CHECKLISTS ==================== */}
      {activeSubTab === 'checklists' && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-850">
            <button 
              onClick={() => setActiveChecklist('packing')}
              className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeChecklist === 'packing' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
            >
              💼 Préparation Valise
            </button>
            <button 
              onClick={() => setActiveChecklist('checkout')}
              className={`ml-6 pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeChecklist === 'checkout' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
            >
              🔑 Check-out Matinal (3h30)
            </button>
          </div>

          {activeChecklist === 'packing' && (
            <div className="card-premium p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-emerald-400" /> Checklist Avant le départ
              </div>
              
              <div className="space-y-2">
                {packingList.map(item => (
                  <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/30 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => togglePackingItem(item.id)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                    <span className={`text-xs ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeChecklist === 'checkout' && (
            <div className="card-premium p-5 space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 text-xs text-amber-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Départ à 03:30 le 12 août</p>
                  <p className="mt-0.5">Veillez à bien effectuer ces étapes pour éviter des frais de pénalité de la résidence Binary Hub.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {checkoutList.map(item => (
                  <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-900/30 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheckoutItem(item.id)}
                      className="accent-emerald-500 w-4 h-4 mt-0.5 rounded"
                    />
                    <span className={`text-xs ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB TAB: SLANG DICTIONARY ==================== */}
      {activeSubTab === 'slang' && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 shadow-lg h-28">
            <img 
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" 
              alt="Irish landscape illustration" 
              className="w-full h-full object-cover brightness-[0.7]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-base font-extrabold text-slate-50 flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-emerald-400" /> Irish Slang Guide
              </h3>
              <p className="text-[10px] text-slate-400">Parlez comme un vrai Dublinois dans les pubs</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {SLANG_DATA.map((item, idx) => {
              const isOpen = openSlangIndex === idx;
              return (
                <div key={idx} className="card-premium overflow-hidden">
                  <button
                    onClick={() => setOpenSlangIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-900/10 transition-colors"
                  >
                    <span className="font-bold text-xs text-emerald-400">{item.word}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{isOpen ? 'Fermer' : 'Définition'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2 text-xs border-t border-slate-900/40 pt-3 bg-slate-950/20">
                      <p className="text-slate-350">{item.definition}</p>
                      <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-2.5 font-mono italic text-[10px] text-slate-400">
                        "{item.example}"
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB: SUGGESTIONS & CHALLENGES ==================== */}
      {activeSubTab === 'suggestions' && (
        <div className="space-y-6">
          
          {/* Guest submission form */}
          <form onSubmit={handleSubmitSuggestion} className="card-premium p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Suggérer un défi / une visite
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Famille ou amis, soumettez un défi ou une visite à faire à Dublin. Il s'affichera directement sur le tableau de bord du voyageur !
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Ex: Boire une pinte de Guinness au Temple Bar..."
                value={newSuggestionText}
                onChange={(e) => setNewSuggestionText(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                required
              />
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black p-2.5 rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Suggestions List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">📋 Liste des défis lancés</h4>
            
            {suggestionsLoading ? (
              <p className="text-center py-6 text-xs text-slate-500 animate-pulse">Chargement des défis...</p>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 card-premium p-6">
                <CheckCircle className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-xs font-semibold">Aucun défi suggéré pour l'instant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((sugg) => (
                  <div 
                    key={sugg.id} 
                    className={`card-premium p-4 flex items-center justify-between gap-4 transition-all ${sugg.completed ? 'border-emerald-500/30 bg-emerald-500/[0.01]' : ''}`}
                  >
                    <div className="flex-grow min-w-0">
                      <p className={`text-xs font-semibold ${sugg.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {sugg.text}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1">
                        Proposé par : <span className="font-bold text-slate-400">{sugg.submitted_by.split('@')[0]}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Toggle status (Admin only) */}
                      {userProfile?.is_admin && (
                        <button 
                          onClick={() => handleToggleComplete(sugg.id, sugg.completed)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${sugg.completed ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-emerald-400'}`}
                          title={sugg.completed ? "Marquer non fait" : "Marquer fait"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Delete (Admin or submitter fallback) */}
                      {(userProfile?.is_admin || userProfile?.email === sugg.submitted_by) && (
                        <button 
                          onClick={() => handleDeleteSuggestion(sugg.id)}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
