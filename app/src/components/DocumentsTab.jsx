import React, { useState, useEffect } from 'react';
import { getSupabase } from '../supabase';
import { 
  FileText, CreditCard, Link, FileDown, UploadCloud, 
  File, Image as ImageIcon, Trash2, Smile
} from 'lucide-react';

export default function DocumentsTab({ userProfile }) {
  const [documents, setDocuments] = useState([]);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('pdf'); // 'pdf' | 'image' | 'wallet'
  const [docUrl, setDocUrl] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [fileBase64, setFileBase64] = useState('');

  const supabase = getSupabase();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setDocLoading(true);
    let loadedDocs = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dublin_documents')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          loadedDocs = data;
        } else {
          throw new Error(error?.message || "Table not found");
        }
      } catch (err) {
        const local = localStorage.getItem('dublin_documents_list');
        if (local) loadedDocs = JSON.parse(local);
      }
    } else {
      const local = localStorage.getItem('dublin_documents_list');
      if (local) loadedDocs = JSON.parse(local);
    }
    setDocuments(loadedDocs);
    setDocLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3.5 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 3.5 Mo). Veuillez compresser l'image ou le PDF avant l'envoi.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    let fileOrLinkData = '';
    if (docType === 'wallet' || docType === 'link') {
      fileOrLinkData = docUrl;
      if (!fileOrLinkData.trim()) {
        alert("Veuillez renseigner le lien du ticket ou Google Wallet.");
        return;
      }
    } else {
      fileOrLinkData = fileBase64;
      if (!fileOrLinkData) {
        alert("Veuillez sélectionner un fichier (PDF ou Image).");
        return;
      }
    }

    const newDoc = {
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      title: docTitle,
      type: docType,
      file_data: fileOrLinkData,
      notes: docNotes,
      user_id: userProfile?.id || null
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    setDocTitle('');
    setDocUrl('');
    setDocNotes('');
    setFileBase64('');

    const fileInput = document.getElementById('doc-file-input-tab');
    if (fileInput) fileInput.value = '';

    if (supabase) {
      try {
        const { error } = await supabase.from('dublin_documents').insert([
          { title: newDoc.title, type: newDoc.type, file_data: newDoc.file_data, notes: newDoc.notes }
        ]);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem('dublin_documents_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_documents_list', JSON.stringify(updated));
    }
  };

  const handleDeleteDocument = async (id) => {
    const updated = documents.filter(doc => doc.id !== id);
    setDocuments(updated);

    if (supabase) {
      try {
        await supabase.from('dublin_documents').delete().eq('id', id);
      } catch (err) {
        localStorage.setItem('dublin_documents_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_documents_list', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cover Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 shadow-lg h-36">
        <img 
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80" 
          alt="Travel documents and passports banner" 
          className="w-full h-full object-cover brightness-[0.65]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-5">
          <h2 className="text-overlay-white text-lg font-extrabold text-slate-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Central d'Embarquement
          </h2>
          <p className="text-overlay-muted text-xs text-slate-400">Tous vos billets d'avion, cartes d'embarquement, réservations et Google Wallet</p>
        </div>
      </div>

      {/* Admin Upload Drawer */}
      {userProfile?.is_admin && (
        <form onSubmit={handleAddDocument} className="card-premium p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" /> Ajouter un billet / document de voyage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nom du document / Titre</label>
              <input 
                type="text"
                placeholder="Ex: Billet d'avion Aller (Aer Lingus)..."
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Type de document</label>
              <select 
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value);
                  setFileBase64('');
                  setDocUrl('');
                }}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500/50"
              >
                <option value="pdf">Fichier PDF (Billet / Résa)</option>
                <option value="image">Fichier Image (Capture d'écran / Photo)</option>
                <option value="wallet">Lien Google Wallet / URL Web</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              {['pdf', 'image'].includes(docType) ? (
                <>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Sélectionner le fichier (max 3.5 Mo)</label>
                  <input 
                    id="doc-file-input-tab"
                    type="file"
                    accept={docType === 'pdf' ? '.pdf' : 'image/*'}
                    onChange={handleFileChange}
                    className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-850 file:cursor-pointer w-full"
                    required
                  />
                </>
              ) : (
                <>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Lien HTTP / URL de téléchargement</label>
                  <input 
                    type="url"
                    placeholder="https://wallet.google.com/... ou https://..."
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Notes de vol ou consignes utiles (Optionnel)</label>
              <input 
                type="text"
                placeholder="Ex: Siège 14C. Vol direct. Embarquement à 13h15 porte A3."
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            Publier dans le central
          </button>
        </form>
      )}

      {/* Grid of Uploaded Tickets */}
      <div className="space-y-4">
        {docLoading ? (
          <p className="text-center py-8 text-xs text-slate-500 animate-pulse">Chargement des billets de voyage...</p>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 card-premium p-6 max-w-md mx-auto">
            <File className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <h4 className="text-xs font-bold text-slate-350">Aucun document disponible</h4>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
              Les billets de vol, cartes d'embarquement et réservations de l'équipe s'afficheront ici dès qu'un administrateur les aura téléversés.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="card-premium p-5 flex flex-col justify-between gap-4 h-full relative group">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-slate-900/80 border border-slate-850 rounded-xl flex items-center justify-center">
                      {doc.type === 'pdf' && <FileText className="w-5 h-5 text-red-400" />}
                      {doc.type === 'image' && <ImageIcon className="w-5 h-5 text-sky-400" />}
                      {doc.type === 'wallet' && <CreditCard className="w-5 h-5 text-amber-500" />}
                      {!['pdf', 'image', 'wallet'].includes(doc.type) && <Link className="w-5 h-5 text-slate-400" />}
                    </div>

                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded-md">
                      {doc.type === 'pdf' && "PDF Document"}
                      {doc.type === 'image' && "Photo / Image"}
                      {doc.type === 'wallet' && "Google Wallet"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 leading-normal">{doc.title}</h4>
                    {doc.notes && <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/20">{doc.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900/40 mt-auto">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                    Mis en ligne le {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {['wallet', 'link'].includes(doc.type) ? (
                      <a 
                        href={doc.file_data} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Google Wallet
                      </a>
                    ) : (
                      <a 
                        href={doc.file_data} 
                        download={doc.title}
                        className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Ouvrir / Télécharger
                      </a>
                    )}

                    {userProfile?.is_admin && (
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 bg-slate-950 hover:bg-rose-500/10 border border-slate-900 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                        title="Supprimer le document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
