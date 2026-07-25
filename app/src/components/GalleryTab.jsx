import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  UploadCloud, Image, Trash2, X, Heart, MessageSquare, 
  Send, Camera, ZoomIn 
} from 'lucide-react';
import { getSupabase } from '../supabase';

// Image compression helper
const compressImage = (file, maxSize = 900, quality = 0.75) => {
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

export default function GalleryTab({ userProfile }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  
  // Comment input state per photo: { [photoId]: { text: string, photo: string|null } }
  const [commentInputs, setCommentInputs] = useState({});

  const currentUser = userProfile?.email || userProfile?.full_name || 'Voyageur';
  const supabase = getSupabase();

  const fetchPhotos = async () => {
    let loadedPhotos = [];
    if (supabase) {
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
          const max_size = 1000;
          
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
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          const newPhoto = {
            id: Math.random().toString(36).substring(2),
            created_at: new Date().toISOString(),
            image: compressedBase64,
            likes: [],
            comments: []
          };

          if (supabase) {
            try {
              const { error } = await supabase.from('dublin_photos').insert([{ 
                image: compressedBase64,
                likes: [],
                comments: []
              }]);
              if (error) throw error;
              fetchPhotos();
            } catch (err) {
              const updated = [newPhoto, ...photos];
              setPhotos(updated);
              localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));
            } finally {
              setLoading(false);
            }
          } else {
            const updated = [newPhoto, ...photos];
            setPhotos(updated);
            localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));
            setLoading(false);
          }
        };
      };
    }
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

  // Add Comment to a Photo
  const handleAddComment = async (photoId) => {
    const inputState = commentInputs[photoId] || {};
    const text = inputState.text || '';
    const commentPhoto = inputState.photo || null;

    if (!text.trim() && !commentPhoto) return;

    const newComment = {
      id: Math.random().toString(36).substring(2),
      author: userProfile?.full_name || currentUser.split('@')[0] || 'Voyageur',
      authorEmail: currentUser,
      content: text,
      photo: commentPhoto,
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

    // Update active lightbox state if open
    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    }

    setCommentInputs(prev => ({ ...prev, [photoId]: { text: '', photo: null } }));

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

  // Handle attached photo selection for comment
  const handleCommentPhotoSelect = async (e, photoId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 800, 0.75);
      setCommentInputs(prev => ({
        ...prev,
        [photoId]: { ...prev[photoId], photo: base64 }
      }));
    } catch (err) {
      alert("Erreur lors de la compression de la photo.");
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
        <div 
          onClick={() => document.getElementById('react-file-input').click()}
          className="border border-dashed border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 text-center bg-slate-900/10 hover:bg-emerald-500/[0.01] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          <input 
            type="file" 
            id="react-file-input" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
            className="hidden" 
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-850">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-slate-350">Ajouter des photos du voyage</p>
            <p className="text-[10px] text-slate-500">JPG/PNG compressé automatiquement</p>
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
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-900 shadow-md group cursor-pointer active:scale-98 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-350"
              >
                <img src={photo.src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Overlay Footer: Date & Like/Comment counts */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300 font-bold">
                  <span className="tracking-wide">{photo.date?.split(' ')[0]}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(photo.id, e)}
                      className={`flex items-center gap-0.5 hover:text-rose-400 transition-colors ${isLiked ? 'text-rose-400' : 'text-slate-400'}`}
                    >
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{likes.length > 0 && likes.length}</span>
                    </button>
                    {comments.length > 0 && (
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>{comments.length}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal (Portal) */}
      {lightboxPhoto && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Image Container */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] max-h-[60vh] md:max-h-[85vh]">
              <img src={lightboxPhoto.src} alt="" className="max-w-full max-h-full object-contain" />
              
              {/* Close & Delete Buttons */}
              <div className="absolute top-4 right-4 flex gap-2.5">
                {userProfile?.is_admin && (
                  <button 
                    type="button"
                    onClick={() => deletePhoto(lightboxPhoto.id)}
                    className="w-9 h-9 bg-slate-900/80 border border-slate-800 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Supprimer la photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="w-9 h-9 bg-slate-900/80 border border-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Panel: Info, Likes & Comments */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-900 p-4 flex flex-col justify-between space-y-4 overflow-y-auto bg-slate-950">
              
              {/* Top Info & Likes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-bold text-slate-500">{lightboxPhoto.date}</span>
                  
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleLike(lightboxPhoto.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      (lightboxPhoto.likes || []).includes(currentUser)
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${(lightboxPhoto.likes || []).includes(currentUser) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{(lightboxPhoto.likes || []).length} Like{(lightboxPhoto.likes || []).length > 1 ? 's' : ''}</span>
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Commentaires ({(lightboxPhoto.comments || []).length})</span>
                  </h4>

                  {(lightboxPhoto.comments || []).length === 0 ? (
                    <p className="text-[9px] text-slate-500 italic py-2">Aucun commentaire pour l'instant.</p>
                  ) : (
                    (lightboxPhoto.comments || []).map(comment => (
                      <div key={comment.id} className="bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-emerald-400">{comment.author}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-slate-500">
                              {new Date(comment.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {(userProfile?.is_admin || comment.authorEmail === currentUser) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(lightboxPhoto.id, comment.id)}
                                className="text-slate-600 hover:text-rose-400 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {comment.content && <p className="text-[10px] text-slate-300 leading-normal">{comment.content}</p>}
                        {comment.photo && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 mt-1">
                            <img src={comment.photo} alt="Photo commentaire" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment Input */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                {commentInputs[lightboxPhoto.id]?.photo && (
                  <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-emerald-500/30">
                    <img src={commentInputs[lightboxPhoto.id].photo} alt="Mini" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-[8px] text-emerald-400 font-bold flex-grow">Photo jointe</span>
                    <button
                      type="button"
                      onClick={() => setCommentInputs(prev => ({
                        ...prev,
                        [lightboxPhoto.id]: { ...prev[lightboxPhoto.id], photo: null }
                      }))}
                      className="text-rose-400 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Commenter cette photo..."
                    value={commentInputs[lightboxPhoto.id]?.text || ''}
                    onChange={(e) => setCommentInputs(prev => ({
                      ...prev,
                      [lightboxPhoto.id]: { ...prev[lightboxPhoto.id], text: e.target.value }
                    }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(lightboxPhoto.id); }}
                    className="flex-grow bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-[10px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />

                  {/* Comment Photo Upload */}
                  <label className="p-2 bg-slate-900 border border-slate-850 rounded-xl text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors flex-shrink-0" title="Joindre une photo">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCommentPhotoSelect(e, lightboxPhoto.id)}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleAddComment(lightboxPhoto.id)}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
