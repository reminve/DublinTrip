import React, { useState, useEffect, useRef } from 'react';
import { Plane, Home, AlertTriangle, RefreshCw, ArrowLeftRight } from 'lucide-react';
import Chart from 'chart.js/auto';

const DEPARTURE_TIME = new Date('2026-08-06T09:00:00+02:00').getTime();
const RETURN_TIME = new Date('2026-08-12T14:30:00+02:00').getTime();

export default function DashboardTab() {
  // Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [tripState, setTripState] = useState('before'); // 'before', 'ongoing', 'after'
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(1);

  // Weather State
  const [weather, setWeather] = useState({ temp: '--', desc: 'Chargement...', wind: '--', humidity: '--', emoji: '☁️', loading: false });

  // Chart ref
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 1. Countdown Logic
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (now < DEPARTURE_TIME) {
        setTripState('before');
        const diff = DEPARTURE_TIME - now;
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else if (now >= DEPARTURE_TIME && now <= RETURN_TIME) {
        setTripState('ongoing');
        const total = RETURN_TIME - DEPARTURE_TIME;
        const elapsed = now - DEPARTURE_TIME;
        setProgressPercent(Math.min(100, Math.max(0, (elapsed / total) * 100)));
        setCurrentDayIndex(Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1);
      } else {
        setTripState('after');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Budget Chart Initialization
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Réservé', 'Sur place'],
          datasets: [{
            data: [770.62, 230.00],
            backgroundColor: ['#10b981', '#fbbf24'],
            borderWidth: 2,
            borderColor: '#0f172a',
            hoverOffset: 4
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${context.raw.toFixed(2)} €`
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  // 3. Weather Fetch
  const fetchWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=53.3498&longitude=-6.2603&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Europe/Dublin");
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const cur = data.current;
      
      const wmoMap = {
        0: ["☀️", "Ciel dégagé"], 1: ["🌤️", "Principalement dégagé"], 2: ["⛅", "Partiellement nuageux"], 3: ["☁️", "Couvert"],
        45: ["🌫️", "Brouillard"], 48: ["🌫️", "Brouillard givrant"],
        51: ["🌧️", "Bruine légère"], 53: ["🌧️", "Bruine modérée"], 55: ["🌧️", "Bruine dense"],
        61: ["🌧️", "Pluie faible"], 63: ["🌧️", "Pluie modérée"], 65: ["🌧️", "Pluie forte"],
        80: ["🌦️", "Averses faibles"], 81: ["🌦️", "Averses modérées"], 82: ["🌦️", "Averses violentes"],
        95: ["⛈️", "Orage faible/modéré"], 96: ["⛈️", "Orage avec grêle"]
      };
      
      const [emoji, desc] = wmoMap[cur.weather_code] || ["☁️", "Nuageux"];
      
      setWeather({
        temp: `${Math.round(cur.temperature_2m)} °C`,
        desc: desc,
        wind: `${Math.round(cur.wind_speed_10m)} km/h`,
        humidity: `${cur.relative_humidity_2m}%`,
        emoji: emoji,
        loading: false
      });
    } catch (err) {
      // Mock Fallback
      setWeather({
        temp: "17 °C",
        desc: "Averses de pluie",
        wind: "18 km/h",
        humidity: "82%",
        emoji: "🌦️",
        loading: false
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      
      {/* ==================== LEFT COLUMN (LOGISTICS & WEATHER) ==================== */}
      <div className="space-y-6">
        
        {/* Banner Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-900/60 shadow-xl h-40 group">
          <img 
            src="./assets/dublin_banner.jpg" 
            alt="Dublin Banner" 
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
            <h2 className="text-lg font-black text-white tracking-tight drop-shadow-md">Mon Dublin Express ☘️</h2>
            <p className="text-xs text-emerald-300 font-bold drop-shadow-sm">Mon Voyage • 6-12 Août 2026</p>
          </div>
        </div>

        {/* Countdown Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900/60 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-800 hover:-translate-y-0.5">
          <div className="absolute -right-6 -bottom-6 text-slate-800/10 text-8xl font-black select-none pointer-events-none">DUB</div>
          
          {tripState === 'before' && (
            <>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Départ pour Dublin dans :</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2.5 shadow-inner">
                  <span className="text-2xl font-extrabold text-emerald-400">{String(countdown.days).padStart(2, '0')}</span>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Jours</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2.5 shadow-inner">
                  <span className="text-2xl font-extrabold text-emerald-400">{String(countdown.hours).padStart(2, '0')}</span>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Heures</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2.5 shadow-inner">
                  <span className="text-2xl font-extrabold text-emerald-400">{String(countdown.minutes).padStart(2, '0')}</span>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Min</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-2.5 shadow-inner">
                  <span className="text-2xl font-extrabold text-emerald-400">{String(countdown.seconds).padStart(2, '0')}</span>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Sec</p>
                </div>
              </div>
            </>
          )}

          {tripState === 'ongoing' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-emerald-400">Jour {currentDayIndex} sur 7</span>
                <span className="text-slate-400">Voyage en cours 🇮🇪✈️</span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-900">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          )}

          {tripState === 'after' && (
            <h3 className="text-emerald-400 text-sm font-bold text-center py-2">Voyage terminé ! Souvenirs impérissables ☘️</h3>
          )}
        </div>

        {/* Budget Chart Card */}
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 shadow-lg backdrop-blur transition-all duration-300 hover:border-slate-800 hover:-translate-y-0.5">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Synthèse du Budget</h3>
          <div className="flex items-center justify-between gap-6">
            <div className="w-32 h-32 flex-shrink-0">
              <canvas ref={chartRef}></canvas>
            </div>
            <div className="flex-grow space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Réservé
                </span>
                <span className="font-bold text-slate-200">770,62 €</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Sur Place
                </span>
                <span className="font-bold text-slate-200">230,00 €</span>
              </div>
              <div className="h-px bg-slate-800/60 my-1"></div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300">Total Séjour</span>
                <span className="font-extrabold text-emerald-400">1 000,62 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dublin Live Weather */}
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 shadow-lg backdrop-blur transition-all duration-300 hover:border-slate-800 hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Météo à Dublin</h3>
            <button 
              type="button"
              onClick={fetchWeather} 
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${weather.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-950/60 rounded-full flex items-center justify-center text-2xl shadow-inner">{weather.emoji}</div>
              <div>
                <span className="text-2xl font-bold text-slate-100">{weather.temp}</span>
                <p className="text-xs text-slate-400">{weather.desc}</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-medium">
              <p>Vent: {weather.wind}</p>
              <p>Humidité: {weather.humidity}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== RIGHT COLUMN (TRANSPORT & HOTEL) ==================== */}
      <div className="space-y-6">
        
        {/* Flight Info Card */}
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4 transition-all duration-300 hover:border-slate-800 hover:-translate-y-0.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2">
              <Plane className="w-4 h-4 text-emerald-400" /> Vols Aer Lingus
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20">T2 Dublin</span>
          </div>
          
          <div className="space-y-4">
            {/* Vol Aller */}
            <div className="flex items-start justify-between text-sm">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">EI 553</span>
                <p className="font-semibold text-slate-200 mt-1">Lyon (LYS) T1 ➔ Dublin (DUB)</p>
                <p className="text-xs text-slate-500 mt-0.5">J1 - 6 août | Décollage 16:45 - Arrivée 18:05</p>
              </div>
              <ArrowLeftRight className="w-4 h-4 text-slate-600 mt-2" />
            </div>
            
            {/* Vol Retour */}
            <div className="flex items-start justify-between text-sm">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">EI 550</span>
                <p className="font-semibold text-slate-200 mt-1">Dublin (DUB) T2 ➔ Lyon (LYS)</p>
                <p className="text-xs text-slate-500 mt-0.5">J7 - 12 août | Décollage 06:15 - Arrivée 09:30</p>
              </div>
            </div>
            
            <div className="bg-slate-950/60 border border-slate-900/60 rounded-xl p-3.5 text-xs text-slate-400 space-y-1 shadow-inner">
              <p className="font-semibold text-slate-300">Bagages autorisés :</p>
              <p>• 10 kg soute enregistré au comptoir (55 x 40 x 24 cm)</p>
              <p>• Petit sac cabine sous le siège (40 x 30 x 20 cm)</p>
            </div>
          </div>
        </div>

        {/* Lodging Card */}
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4 transition-all duration-300 hover:border-slate-800 hover:-translate-y-0.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" /> Logement Dublin
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full border border-slate-700">6 nuits</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-slate-200">aparto Binary Hub Apartments</p>
              <p className="text-xs text-slate-400 mt-0.5">Bonham St, Usher's Island, Dublin, D08 X244</p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">Chambre + SDB privée (327,00 €)</p>
            </div>
            
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 text-xs text-amber-400 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Check-out précoce (12 août)
              </p>
              <p>Départ obligatoire à <strong>03h30</strong>. La réception/gardien est ouverte 24h/24 ou utiliser la boîte de dépôt (Key Drop Box) pour laisser les clés.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
