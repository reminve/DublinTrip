import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, CornerDownRight } from 'lucide-react';
import L from 'leaflet';
import { getSupabase } from '../supabase';

const DUBLIN_CENTER = [53.3498, -6.2603];

export default function TrackingTab({ userProfile }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trackLineRef = useRef(null);
  const markerRef = useRef(null);
  
  // Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [gpsData, setGpsData] = useState({ coords: 'Inactif', accuracy: '--', stats: '--', time: '--' });
  const watchIdRef = useRef(null);
  const trackingPointsRef = useRef([]);

  const supabase = getSupabase();

  // Load history
  const loadGPSHistory = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('dublin_gps')
        .select('lat, lng, accuracy, alt, speed, created_at')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const pts = data.map(pt => [pt.lat, pt.lng]);
        trackingPointsRef.current = pts;
        
        if (trackLineRef.current) {
          trackLineRef.current.setLatLngs(pts);
        }
        
        const last = data[data.length - 1];
        updateGPSCard(last.lat, last.lng, last.accuracy, last.alt, last.speed, last.created_at);
        updateMapMarker([last.lat, last.lng]);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([last.lat, last.lng], 14);
        }
      }
    } catch (err) {
      console.warn("Could not load GPS history:", err.message);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(DUBLIN_CENTER, 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      trackLineRef.current = L.polyline([], {
        color: '#10b981',
        weight: 4,
        opacity: 0.8,
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      loadGPSHistory();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateGPSCard = (lat, lng, accuracy, alt, speed, timestamp) => {
    const time = new Date(timestamp).toLocaleTimeString('fr-FR');
    const speedKmh = speed ? (speed * 3.6).toFixed(1) : '0';
    const altitude = alt ? parseFloat(alt).toFixed(0) : '--';
    
    setGpsData({
      coords: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      accuracy: `± ${accuracy.toFixed(0)} m`,
      stats: `${speedKmh} km/h | Alt: ${altitude}m`,
      time: time
    });
  };

  const updateMapMarker = (point) => {
    if (!mapInstanceRef.current) return;
    
    if (!markerRef.current) {
      const greenIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative flex items-center justify-center w-6 h-6"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900 shadow"></span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      markerRef.current = L.marker(point, { icon: greenIcon }).addTo(mapInstanceRef.current);
    } else {
      markerRef.current.setLatLng(point);
    }
  };

  const toggleTracking = () => {
    if (!userProfile.is_admin) {
      alert("Action refusée : Seul le voyageur admin peut activer son tracking GPS.");
      return;
    }

    if (!isTracking) {
      if (!navigator.geolocation) {
        alert("GPS non supporté.");
        return;
      }
      setIsTracking(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => handleGPSUpdate(pos.coords, pos.timestamp),
        (err) => {
          console.warn("GPS error:", err.message);
          setGpsData(prev => ({ ...prev, coords: "Signal indisponible" }));
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      setIsTracking(false);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
  };

  const handleGPSUpdate = async (coords, timestamp) => {
    const lat = coords.latitude;
    const lng = coords.longitude;
    const accuracy = coords.accuracy;
    
    updateGPSCard(lat, lng, accuracy, coords.altitude, coords.speed, timestamp);
    
    const point = [lat, lng];
    trackingPointsRef.current.push(point);
    
    if (trackLineRef.current) {
      trackLineRef.current.setLatLngs(trackingPointsRef.current);
    }
    updateMapMarker(point);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(point);
    }

    try {
      await supabase.from('dublin_gps').insert([{
        lat: lat,
        lng: lng,
        accuracy: accuracy,
        alt: coords.altitude ? parseFloat(coords.altitude) : null,
        speed: coords.speed ? parseFloat(coords.speed) : null
      }]);
    } catch (err) {
      console.warn("Supabase GPS insert error:", err.message);
    }
  };

  // Simulation
  const [demoIndex, setDemoIndex] = useState(0);
  const simulateGPSMove = () => {
    if (!userProfile.is_admin) {
      alert("Seul le voyageur admin peut simuler un déplacement.");
      return;
    }
    
    const demoTrail = [
      [53.3498, -6.2603], [53.3490, -6.2615], [53.3478, -6.2630], [53.3468, -6.2645],
      [53.3458, -6.2660], [53.3444, -6.2678], [53.3435, -6.2690]
    ];
    
    const point = demoTrail[demoIndex % demoTrail.length];
    setDemoIndex(prev => prev + 1);
    
    handleGPSUpdate({
      latitude: point[0],
      longitude: point[1],
      accuracy: 8,
      speed: 1.5,
      altitude: 15
    }, Date.now());
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Géolocalisation Live</h3>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={toggleTracking} 
            className={`text-xs border font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${isTracking ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:text-rose-300' : 'bg-slate-900 border-slate-800 text-rose-450 hover:text-rose-400'}`}
          >
            {isTracking ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isTracking ? "Arrêter" : "Activer"}</span>
          </button>
          <button 
            type="button"
            onClick={simulateGPSMove} 
            className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> 
            <span>Simuler</span>
          </button>
        </div>
      </div>

      {/* Main Map with Overlay Panel */}
      <div className="relative rounded-3xl border border-slate-900/60 overflow-hidden shadow-2xl bg-slate-950 h-[500px] w-full">
        {/* Leaflet Map */}
        <div ref={mapContainerRef} className="w-full h-full z-10"></div>

        {/* Floating Telemetry Stats Overlay */}
        <div className="absolute top-4 left-4 z-20 max-w-xs w-[calc(100%-2rem)] sm:w-64 bg-slate-950/80 border border-slate-900 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3 pointer-events-auto">
          <div className="flex items-center gap-2 border-b border-slate-900/40 pb-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isTracking ? 'inline-flex' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isTracking ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">État du Signal GPS</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="space-y-0.5 col-span-2">
              <p className="text-slate-500 font-bold uppercase text-[8px] tracking-wide">Coordonnées</p>
              <p className="font-mono text-slate-200 truncate" title={gpsData.coords}>{gpsData.coords}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-500 font-bold uppercase text-[8px] tracking-wide">Précision</p>
              <p className="font-mono text-slate-200">{gpsData.accuracy}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-500 font-bold uppercase text-[8px] tracking-wide">Vitesse / Alt</p>
              <p className="font-mono text-slate-200">{gpsData.stats}</p>
            </div>
            <div className="space-y-0.5 col-span-2 border-t border-slate-900/40 pt-1.5">
              <p className="text-slate-500 font-bold uppercase text-[8px] tracking-wide">Dernière mise à jour</p>
              <p className="font-mono text-slate-200">{gpsData.time}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
