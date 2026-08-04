import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async (mode) => {
    setErrorMsg('');
    setLoading(true);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès direct à la caméra n'est pas disponible sur ce navigateur.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera stream error:", err);
      setErrorMsg(err.message || "Impossible d'accéder à l'appareil photo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;

    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col space-y-4 p-5 relative text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Appareil Photo en Direct</h3>
          </div>
          <button 
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder or Captured Preview */}
        <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner">
          {capturedImage ? (
            <img src={capturedImage} alt="Photo prise" className="w-full h-full object-cover" />
          ) : errorMsg ? (
            <div className="p-6 text-center text-slate-400 space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-xs">{errorMsg}</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
          )}

          {/* Loading spinner */}
          {loading && !capturedImage && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          {capturedImage ? (
            <>
              <button 
                type="button" 
                onClick={handleRetake} 
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reprendre
              </button>
              <button 
                type="button" 
                onClick={handleConfirm} 
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Valider la photo
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={handleSwitchCamera} 
                disabled={loading || !!errorMsg}
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                title="Changer de caméra"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Inverser ({facingMode === 'environment' ? 'Arrière' : 'Avant'})</span>
              </button>

              <button 
                type="button" 
                onClick={takeSnapshot} 
                disabled={loading || !!errorMsg}
                className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 border-4 border-white dark:border-slate-950 transition-transform active:scale-95 cursor-pointer"
                title="Prendre la photo"
              >
                <div className="w-6 h-6 rounded-full bg-slate-950" />
              </button>

              <div className="w-10" />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
