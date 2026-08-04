import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getSupabase } from '../supabase';
import { isOnline, addToOfflineQueue } from '../offlineSync';
import { 
  FileText, CreditCard, Link, FileDown, UploadCloud, 
  File, Image as ImageIcon, Trash2, X, ZoomIn, ExternalLink, Camera
} from 'lucide-react';
import CameraModal from './CameraModal';

// ── PDF.js canvas renderer (works on mobile where iframes fail) ──────────────
function MobilePDFViewer({ dataUrl }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    setLoading(true);
    setPages([]);
    setError(false);

    const render = async () => {
      try {
        // Load PDF.js from CDN if not already loaded
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const pdf = await window.pdfjsLib.getDocument(dataUrl).promise;
        const rendered = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled.current) return;
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width;
          canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          rendered.push(canvas.toDataURL('image/jpeg', 0.92));
        }

        if (!cancelled.current) {
          setPages(rendered);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled.current) { setError(true); setLoading(false); }
      }
    };

    render();
    return () => { cancelled.current = true; };
  }, [dataUrl]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 h-64 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
      <p className="text-xs font-semibold">Rendu du PDF en cours...</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center gap-2 h-64 text-rose-400 text-center px-6">
      <p className="text-sm font-bold">⚠️ Impossible d'afficher ce PDF</p>
      <p className="text-xs text-slate-500">Utilisez le bouton "Ouvrir" pour le consulter dans votre navigateur.</p>
    </div>
  );
  return (
    <div className="w-full space-y-2 overflow-y-auto">
      {pages.map((src, i) => (
        <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full" />
      ))}
    </div>
  );
}

export default function DocumentsTab({ userProfile }) {
  const [documents, setDocuments] = useState([]);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('pdf');
  const [docUrl, setDocUrl] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [fileBase64, setFileBase64] = useState('');

  // Viewer state
  const [previewDoc, setPreviewDoc] = useState(null); // { title, type, file_data }
  const [showCameraModal, setShowCameraModal] = useState(false);

  const supabase = getSupabase();

  useEffect(() => {
    loadDocuments();
    const handleSyncComplete = () => loadDocuments();
    window.addEventListener('offline-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('offline-sync-complete', handleSyncComplete);
  }, []);

  const loadDocuments = async () => {
    setDocLoading(true);
    let loadedDocs = [];
    if (supabase && isOnline()) {
      try {
        const { data, error } = await supabase
          .from('dublin_documents')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          loadedDocs = data;
          localStorage.setItem('dublin_documents_list', JSON.stringify(data));
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
    localStorage.setItem('dublin_documents_list', JSON.stringify(updated));
    setDocTitle('');
    setDocUrl('');
    setDocNotes('');
    setFileBase64('');

    const fileInput = document.getElementById('doc-file-input-tab');
    if (fileInput) fileInput.value = '';

    const payload = { title: newDoc.title, type: newDoc.type, file_data: newDoc.file_data, notes: newDoc.notes };

    if (supabase && isOnline()) {
      try {
        const { error } = await supabase.from('dublin_documents').insert([payload]);
        if (error) throw error;
      } catch (err) {
        addToOfflineQueue({ type: 'INSERT', table: 'dublin_documents', data: payload });
      }
    } else {
      addToOfflineQueue({ type: 'INSERT', table: 'dublin_documents', data: payload });
    }
  };

  const handleDeleteDocument = async (id) => {
    const updated = documents.filter(doc => doc.id !== id);
    setDocuments(updated);
    localStorage.setItem('dublin_documents_list', JSON.stringify(updated));

    if (supabase && isOnline()) {
      try {
        await supabase.from('dublin_documents').delete().eq('id', id);
      } catch (err) {
        addToOfflineQueue({ type: 'DELETE', table: 'dublin_documents', data: { id } });
      }
    } else {
      addToOfflineQueue({ type: 'DELETE', table: 'dublin_documents', data: { id } });
    }
  };

  // Download helper (explicit user action only)
  const handleDownload = (doc) => {
    const a = document.createElement('a');
    a.href = doc.file_data;
    a.download = doc.title;
    a.click();
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
              {docType === 'image' ? (
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Prendre une photo ou choisir une image</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Direct Mobile Camera */}
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span>Appareil photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* WebRTC Live Camera Modal */}
                    <button
                      type="button"
                      onClick={() => setShowCameraModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Caméra Live</span>
                    </button>

                    {/* Gallery input */}
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <span>Galerie / Fichier</span>
                      <input
                        id="doc-file-input-tab"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {fileBase64 && <p className="text-[10px] text-emerald-400 font-mono mt-1">✓ Photo/Image chargée avec succès</p>}
                </div>
              ) : docType === 'pdf' ? (
                <>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Sélectionner le fichier PDF (max 3.5 Mo)</label>
                  <input 
                    id="doc-file-input-tab"
                    type="file"
                    accept=".pdf"
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

                  {/* Inline preview thumbnail for images */}
                  {doc.type === 'image' && doc.file_data && (
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="w-full h-32 rounded-xl overflow-hidden border border-slate-800 cursor-zoom-in relative group/thumb"
                    >
                      <img
                        src={doc.file_data}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 leading-normal">{doc.title}</h4>
                    {doc.notes && <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/20">{doc.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900/40 mt-auto">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                    {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short'
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Wallet / external link */}
                    {['wallet', 'link'].includes(doc.type) && (
                      <a 
                        href={doc.file_data} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Google Wallet
                      </a>
                    )}

                    {/* Preview button for PDF & image */}
                    {['pdf', 'image'].includes(doc.type) && doc.file_data && (
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ZoomIn className="w-3.5 h-3.5" /> Aperçu
                      </button>
                    )}

                    {/* Explicit download (admin only) */}
                    {userProfile?.is_admin && ['pdf', 'image'].includes(doc.type) && doc.file_data && (
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="p-2 bg-slate-950 border border-slate-900 text-slate-500 hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                        title="Télécharger"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
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

      {/* ==================== DOCUMENT VIEWER MODAL (Portal) ==================== */}
      {previewDoc && createPortal(
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 dark:bg-black/90 backdrop-blur-sm flex flex-col"
          onClick={() => setPreviewDoc(null)}
        >
          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-5 py-3 bg-white/95 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              {previewDoc.type === 'pdf'
                ? <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                : <ImageIcon className="w-4 h-4 text-sky-500 flex-shrink-0" />
              }
              <span className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{previewDoc.title}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Open in new tab */}
              {(previewDoc.type !== 'pdf' || window.innerWidth >= 768) && (
                <a
                  href={previewDoc.file_data}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
                </a>
              )}
              {/* Download */}
              {userProfile?.is_admin && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDownload(previewDoc); }}
                  className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" /> Télécharger
                </button>
              )}
              {/* Close */}
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-9 h-9 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer body */}
          <div
            className="flex-1 overflow-auto flex items-start justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {previewDoc.type === 'pdf' ? (
              // Desktop: iframe renders natively. Mobile: PDF.js canvas renderer.
              window.innerWidth >= 768 ? (
                <iframe
                  src={previewDoc.file_data}
                  title={previewDoc.title}
                  className="w-full max-w-4xl h-full min-h-[70vh] rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="w-full max-w-lg">
                  <MobilePDFViewer dataUrl={previewDoc.file_data} />
                </div>
              )
            ) : (
              <img
                src={previewDoc.file_data}
                alt={previewDoc.title}
                className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
              />
            )}
          </div>

          {/* Notes footer */}
          {previewDoc.notes && (
            <div
              className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {previewDoc.notes}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Camera Modal */}
      <CameraModal 
        isOpen={showCameraModal} 
        onClose={() => setShowCameraModal(false)} 
        onCapture={(base64) => setFileBase64(base64)} 
      />
    </div>
  );
}
