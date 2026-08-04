import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  UploadCloud, Image, Trash2, X, Heart, MessageSquare, Send, Camera
} from 'lucide-react';
import { getSupabase } from '../supabase';
import { isOnline, addToOfflineQueue } from '../offlineSync';
import CameraModal from './CameraModal';

export default function GalleryTab({ userProfile }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  
  // Comment text input state per photo: { [photoId]: string }
  const [commentTexts, setCommentTexts] = useState({});

  const currentUser = userProfile?.email || userProfile?.full_name || 'Voyageur';
  const supabase = getSupabase();

  const fetchPhotos = async () => {
    let loadedPhotos = [];
    if (supabase && isOnline()) {
      try {
        const { data, error } = await supabase
          .from('dublin_photos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          loadedPhotos = data.map(p => ({
            id: p.id,
            src: p.image,
            date: new Date(p.created_at).toLocaleString('fr-FR'),
            created_at: p.created_at,
            likes: Array.isArray(p.likes) ? p.likes : (p.likes ? JSON.parse(p.likes) : []),
            comments: Array.isArray(p.comments) ? p.comments : (p.comments ? JSON.parse(p.comments) : [])
          }));
          localStorage.setItem('dublin_gallery_photos', JSON.stringify(loadedPhotos));
        } else {
          throw new Error(error?.message || "Table not found");
        }
      } catch (err) {
        const local = localStorage.getItem('dublin_gallery_photos');
        if (local) loadedPhotos = JSON.parse(local);
      }
    } else {
      const local = localStorage.getItem('dublin_gallery_photos');
      if (local) loadedPhotos = JSON.parse(local);
    }

    setPhotos(loadedPhotos);
  };

  useEffect(() => {
    fetchPhotos();
    const handleSyncComplete = () => fetchPhotos();
    window.addEventListener('offline-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('offline-sync-complete', handleSyncComplete);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const uploadFiles = (files) => {
    if (!userProfile?.is_admin) {
      alert("Seul le voyageur admin peut ajouter des photos.");
      return;
    }

    setLoading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 1200;
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          
          const newPhoto = {
            id: Math.random().toString(36).substring(2),
            created_at: new Date().toISOString(),
            image: compressedBase64,
            likes: [],
            comments: []
          };

          const payload = { image: compressedBase64, likes: [], comments: [] };
          const updated = [newPhoto, ...photos];
          setPhotos(updated);
          localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));

          if (supabase && isOnline()) {
            try {
              const { error } = await supabase.from('dublin_photos').insert([payload]);
              if (error) throw error;
            } catch (err) {
              addToOfflineQueue({ type: 'INSERT', table: 'dublin_photos', data: payload });
            } finally {
              setLoading(false);
            }
          }
        };
      };
    }
  };

  const handleDirectPhotoAdd = async (base64) => {
    if (!userProfile?.is_admin) {
      alert("Seul le voyageur admin peut ajouter des photos.");
      return;
    }
    setLoading(true);

    const img = new window.Image();
    img.src = base64;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      let width = img.width || 1200;
      let height = img.height || 900;
      const max_size = 1200;
      if (width > height) {
        if (width > max_size) { height *= max_size / width; width = max_size; }
      } else {
        if (height > max_size) { width *= max_size / height; height = max_size; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const cleanBase64 = canvas.toDataURL('image/jpeg', 0.85);

      const newPhoto = {
        id: Math.random().toString(36).substring(2),
        created_at: new Date().toISOString(),
        image: cleanBase64,
        likes: [],
        comments: []
      };
      const payload = { image: cleanBase64, likes: [], comments: [] };
      const updated = [newPhoto, ...photos];
      setPhotos(updated);
      localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));

      if (supabase && isOnline()) {
        try {
          const { error } = await supabase.from('dublin_photos').insert([payload]);
          if (error) throw error;
        } catch (err) {
          addToOfflineQueue({ type: 'INSERT', table: 'dublin_photos', data: payload });
        } finally {
          setLoading(false);
        }
      } else {
        addToOfflineQueue({ type: 'INSERT', table: 'dublin_photos', data: payload });
        setLoading(false);
      }
    };
  };

  const deletePhoto = async (id) => {
    if (!userProfile?.is_admin) return;
    if (!confirm("Voulez-vous supprimer cette photo ?")) return;

    setLightboxPhoto(null);
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));

    if (supabase) {
      try {
        await supabase.from('dublin_photos').delete().eq('id', id);
      } catch (err) {
        console.warn("Delete photo error:", err);
      }
    }
  };

  // Toggle Like on a Photo
  const handleToggleLike = async (photoId, e) => {
    if (e) e.stopPropagation();

    const updated = photos.map(p => {
      if (p.id === photoId) {
        const likes = Array.isArray(p.likes) ? p.likes : [];
        const hasLiked = likes.includes(currentUser);
        const newLikes = hasLiked ? likes.filter(u => u !== currentUser) : [...likes, currentUser];
        return { ...p, likes: newLikes };
      }
      return p;
    });

    setPhotos(updated);
    localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));

    // Update active lightbox state if open
    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto(prev => {
        const likes = Array.isArray(prev.likes) ? prev.likes : [];
        const hasLiked = likes.includes(currentUser);
        const newLikes = hasLiked ? likes.filter(u => u !== currentUser) : [...likes, currentUser];
        return { ...prev, likes: newLikes };
      });
    }

    if (supabase) {
      const target = updated.find(p => p.id === photoId);
      try {
        await supabase.from('dublin_photos').update({ likes: target.likes }).eq('id', photoId);
      } catch (err) {
        console.warn("DB like photo update error:", err);
      }
    }
  };

  // Add Text Comment to a Photo
  const handleAddComment = async (photoId) => {
    const text = commentTexts[photoId] || '';
    if (!text.trim()) return;

    const newComment = {
      id: Math.random().toString(36).substring(2),
      author: userProfile?.full_name || currentUser.split('@')[0] || 'Voyageur',
      authorEmail: currentUser,
      content: text,
      created_at: new Date().toISOString()
    };

    const updated = photos.map(p => {
      if (p.id === photoId) {
        const comments = Array.isArray(p.comments) ? p.comments : [];
        return { ...p, comments: [...comments, newComment] };
      }
      return p;
    });

    setPhotos(updated);
    localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));

    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    }

    setCommentTexts(prev => ({ ...prev, [photoId]: '' }));

    if (supabase) {
      const target = updated.find(p => p.id === photoId);
      try {
        await supabase.from('dublin_photos').update({ comments: target.comments }).eq('id', photoId);
      } catch (err) {
        console.warn("DB comment photo update error:", err);
      }
    }
  };

  // Delete Comment from a Photo
  const handleDeleteComment = async (photoId, commentId) => {
    const updated = photos.map(p => {
      if (p.id === photoId) {
        const filtered = (p.comments || []).filter(c => c.id !== commentId);
        return { ...p, comments: filtered };
      }
      return p;
    });

    setPhotos(updated);
    localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));

    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto(prev => ({
        ...prev,
        comments: (prev.comments || []).filter(c => c.id !== commentId)
      }));
    }

    if (supabase) {
      const target = updated.find(p => p.id === photoId);
      try {
        await supabase.from('dublin_photos').update({ comments: target.comments }).eq('id', photoId);
      } catch (err) {
        console.warn("DB comment delete error:", err);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Album Photos Privé</h3>
        <span className="text-xs text-slate-500">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
      </div>

      {/* Upload zone (Admin only) */}
      {userProfile?.is_admin && (
        <div className="card-premium p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" /> Ajouter des photos au voyage
            </h4>
            <span className="text-[10px] text-slate-500">Appareil photo ou Galerie</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Direct Mobile Camera */}
            <label className="flex flex-col items-center justify-center p-3.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 text-center group">
              <Camera className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Appareil Photo</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">Prise de vue mobile directe</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => handleDirectPhotoAdd(ev.target.result);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} 
                className="hidden" 
              />
            </label>

            {/* WebRTC Live Camera Modal */}
            <button 
              type="button"
              onClick={() => setShowCameraModal(true)}
              className="flex flex-col items-center justify-center p-3.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 text-center group"
            >
              <Camera className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">Caméra Live</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">Capture vidéo directe</span>
            </button>

            {/* Gallery Upload */}
            <label className="flex flex-col items-center justify-center p-3.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 text-center group">
              <Image className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Galerie / Fichiers</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">Importer des fichiers</span>
              <input 
                type="file" 
                id="react-file-input" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}

      {/* Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 text-slate-500 space-y-2">
          <Image className="w-10 h-10 mx-auto text-slate-700" />
          <p className="text-xs font-medium">Aucune photo dans la galerie pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map(photo => {
            const likes = Array.isArray(photo.likes) ? photo.likes : [];
            const comments = Array.isArray(photo.comments) ? photo.comments : [];
            const isLiked = likes.includes(currentUser);

            return (
              <div 
                key={photo.id}
                onClick={() => setLightboxPhoto(photo)}
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-900 shadow-md group cursor-pointer active:scale-98 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-350 bg-slate-100 dark:bg-slate-900"
              >
                <img src={photo.src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                {/* Overlay Footer: Date & Like/Comment counts (Always white text over gradient) */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-white font-bold drop-shadow z-10">
                  <span className="tracking-wide text-white">{photo.date?.split(' ')[0]}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(photo.id, e)}
                      className={`flex items-center gap-0.5 transition-colors ${isLiked ? 'text-rose-400' : 'text-white hover:text-rose-400'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                      <span className="text-white">{likes.length > 0 && likes.length}</span>
                    </button>
                    {comments.length > 0 && (
                      <span className="flex items-center gap-0.5 text-white">
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                        <span className="text-white">{comments.length}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Large Lightbox Modal (Portal) */}
      {lightboxPhoto && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 dark:bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-6xl w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Large Image Container */}
            <div className="flex-[3] bg-slate-100 dark:bg-black flex items-center justify-center relative p-2 min-h-[350px] md:min-h-[550px] max-h-[65vh] md:max-h-[88vh]">
              <img src={lightboxPhoto.src} alt="" className="max-w-full max-h-[84vh] w-auto h-auto object-contain shadow-2xl rounded-xl" />
              
              {/* Top Action Buttons on Image */}
              <div className="absolute top-4 right-4 flex gap-2.5 z-10">
                {userProfile?.is_admin && (
                  <button 
                    type="button"
                    onClick={() => deletePhoto(lightboxPhoto.id)}
                    className="w-10 h-10 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer shadow-lg"
                    title="Supprimer la photo"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="w-10 h-10 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side Panel: Info, Likes & Comments */}
            <div className="w-full md:w-85 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-900 p-4 flex flex-col justify-between space-y-4 overflow-y-auto bg-white dark:bg-slate-950">
              
              {/* Header & Likes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{lightboxPhoto.date}</span>
                  
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleLike(lightboxPhoto.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      (lightboxPhoto.likes || []).includes(currentUser)
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${(lightboxPhoto.likes || []).includes(currentUser) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{(lightboxPhoto.likes || []).length} Like{(lightboxPhoto.likes || []).length > 1 ? 's' : ''}</span>
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Commentaires ({(lightboxPhoto.comments || []).length})</span>
                  </h4>

                  {(lightboxPhoto.comments || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-3 text-center">Aucun commentaire. Soyez le premier à commenter !</p>
                  ) : (
                    (lightboxPhoto.comments || []).map(comment => (
                      <div key={comment.id} className="bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-850 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{comment.author}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                              {new Date(comment.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {(userProfile?.is_admin || comment.authorEmail === currentUser) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(lightboxPhoto.id, comment.id)}
                                className="text-slate-400 hover:text-rose-500 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-normal font-medium">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment Input (Text only) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-900">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ecrire un commentaire..."
                    value={commentTexts[lightboxPhoto.id] || ''}
                    onChange={(e) => setCommentTexts(prev => ({
                      ...prev,
                      [lightboxPhoto.id]: e.target.value
                    }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(lightboxPhoto.id); }}
                    className="flex-grow bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 font-medium"
                  />

                  <button
                    type="button"
                    onClick={() => handleAddComment(lightboxPhoto.id)}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer flex-shrink-0 shadow"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Camera Modal */}
      <CameraModal 
        isOpen={showCameraModal} 
        onClose={() => setShowCameraModal(false)} 
        onCapture={handleDirectPhotoAdd} 
      />
    </div>
  );
}
