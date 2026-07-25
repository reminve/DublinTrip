import React, { useState, useEffect } from 'react';
import { getSupabase } from '../supabase';
import { 
  CheckSquare, MessageSquare, BookOpen, AlertCircle, Trash2, 
  CheckCircle, Send, Globe
} from 'lucide-react';

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

  // Load Checklists and Lists
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
      <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-900/60 max-w-sm">
        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'checklists' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Valise & Check-out</span>
        </button>
        <button
          onClick={() => setActiveSubTab('slang')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'slang' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Argot Irlandais</span>
        </button>
        <button
          onClick={() => setActiveSubTab('suggestions')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'suggestions' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Suggestions</span>
        </button>
      </div>

      {/* ==================== SUB TAB: CHECKLISTS ==================== */}
      {activeSubTab === 'checklists' && (
        <div className="space-y-4">
          
          <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-900/60 max-w-[280px]">
            <button 
              onClick={() => setActiveChecklist('packing')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeChecklist === 'packing' ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Ma Valise
            </button>
            <button 
              onClick={() => setActiveChecklist('checkout')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeChecklist === 'checkout' ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Check-out 3h30
            </button>
          </div>

          {activeChecklist === 'packing' && (
            <div className="card-premium p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350">Checklist Avant le départ</h4>
              </div>
              <div className="space-y-2">
                {packingList.map(item => (
                  <label key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/30 transition-all cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => togglePackingItem(item.id)}
                      className="w-4 h-4 rounded border-slate-900 bg-slate-950 text-emerald-500 accent-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={item.checked ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeChecklist === 'checkout' && (
            <div className="card-premium p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350">Départ matinal (03h30)</h4>
              </div>
              <div className="space-y-2">
                {checkoutList.map(item => (
                  <label key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/30 transition-all cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => toggleCheckoutItem(item.id)}
                      className="w-4 h-4 rounded border-slate-900 bg-slate-950 text-emerald-500 accent-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={item.checked ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {item.text}
                    </span>
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
              <h3 className="text-overlay-white text-base font-extrabold text-slate-50 flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-emerald-400" /> Irish Slang Guide
              </h3>
              <p className="text-overlay-muted text-[10px] text-slate-400">Parlez comme un vrai Dublinois dans les pubs</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {SLANG_DATA.map((item, idx) => {
              const isOpen = openSlangIndex === idx;
              return (
                <div key={idx} className="card-premium overflow-hidden">
                  <button
                    onClick={() => setOpenSlangIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-slate-900/10"
                  >
                    <span className="text-xs font-bold text-slate-200">{item.word}</span>
                    <span className="text-xs text-slate-500 font-bold">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-900/40 text-xs space-y-2 bg-slate-950/20">
                      <p className="text-slate-350 leading-relaxed"><strong className="text-slate-400">Signification :</strong> {item.definition}</p>
                      <p className="text-[10px] text-emerald-400 italic font-medium"><strong className="text-slate-500 not-italic">Exemple :</strong> "{item.example}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB: SUGGESTIONS ==================== */}
      {activeSubTab === 'suggestions' && (
        <div className="space-y-4">
          
          <form onSubmit={handleSubmitSuggestion} className="card-premium p-5 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> La Boîte à défis
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Famille, amis... Lancez des défis insolites ou proposez des suggestions de lieux à visiter à Dublin !
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Ex: Boire une pinte de Smithwick's, trouver Molly Malone..."
                value={newSuggestionText}
                onChange={(e) => setNewSuggestionText(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                required
              />
              <button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black p-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </form>

          {/* Suggestions List */}
          <div className="space-y-3">
            {suggestionsLoading ? (
              <p className="text-center py-6 text-xs text-slate-500 animate-pulse">Chargement des défis...</p>
            ) : suggestions.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-600">Aucun défi lancé pour l'instant. Soyez le premier !</p>
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
