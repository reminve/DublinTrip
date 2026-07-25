import React, { useState, useEffect } from 'react';
import { UploadCloud, Image, Trash2, X } from 'lucide-react';
import { getSupabase } from '../supabase';

export default function GalleryTab({ userProfile }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const supabase = getSupabase();

  const fetchPhotos = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('dublin_photos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPhotos(data.map(p => ({
        id: p.id,
        src: p.image,
        date: new Date(p.created_at).toLocaleString('fr-FR')
      })));
    } catch (err) {
      console.error("Error loading photos:", err);
    }
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
    if (!userProfile.is_admin) {
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
          
          try {
            const { error } = await supabase.from('dublin_photos').insert([{ image: compressedBase64 }]);
            if (error) throw error;
            fetchPhotos();
          } catch (err) {
            alert("Erreur lors de l'envoi de la photo: " + err.message);
          } finally {
            setLoading(false);
          }
        };
      };
    }
  };

  const deletePhoto = async (id) => {
    if (!userProfile.is_admin) return;
    if (!confirm("Voulez-vous supprimer cette photo ?")) return;

    setLightboxPhoto(null);
    try {
      const { error } = await supabase.from('dublin_photos').delete().eq('id', id);
      if (error) throw error;
      fetchPhotos();
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Album Photos Privé</h3>
        <span className="text-xs text-slate-500">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
      </div>

      {/* Upload zone (Admin only) */}
      {userProfile.is_admin && (
        <div 
          onClick={() => document.getElementById('react-file-input').click()}
          className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500/60 bg-slate-900/10 hover:bg-slate-900/40 transition-all cursor-pointer"
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
            <div className="w-10 h-10 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-800">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-slate-300">Ajouter des photos du voyage</p>
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
        <div className="grid grid-cols-2 gap-3">
          {photos.map(photo => (
            <div 
              key={photo.id}
              onClick={() => setLightboxPhoto(photo)}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-800/80 shadow-md group cursor-pointer active:scale-98 transition-all"
            >
              <img src={photo.src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <p className="absolute bottom-2 left-2 text-[10px] text-slate-300 font-medium">{photo.date.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex gap-4">
            {userProfile.is_admin && (
              <button 
                onClick={() => deletePhoto(lightboxPhoto.id)}
                className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-rose-400 active:scale-95 transition-transform cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setLightboxPhoto(null)}
              className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-300 active:scale-95 transition-transform cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img src={lightboxPhoto.src} alt="" className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl" />
          <p className="text-xs text-slate-500 mt-4">{lightboxPhoto.date}</p>
        </div>
      )}
    </div>
  );
}
