import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plane, Home, AlertTriangle, RefreshCw, ArrowLeftRight, 
  Plus, Trash2, X, Calendar, DollarSign, Tag, Clock
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { getSupabase } from '../supabase';

const DEPARTURE_TIME = new Date('2026-08-06T09:00:00+02:00').getTime();
const RETURN_TIME = new Date('2026-08-12T14:30:00+02:00').getTime();

const DEFAULT_EXPENSES = [
  { id: 'e1', title: "TCD.IE BOOK OF K DUB", amount: 21.00, category: 'reserved', date: '2026-07-25', note: 'Book of Kells' },
  { id: 'e2', title: "Guinness Storehouse Dub", amount: 22.50, category: 'reserved', date: '2026-07-25', note: 'Visite Guinness' },
  { id: 'e3', title: "DT Dublin Express BER", amount: 12.00, category: 'reserved', date: '2026-07-25', note: 'Bus Navette' },
  { id: 'e4', title: "SNCF", amount: 22.00, category: 'reserved', date: '2026-07-25', note: 'Train aller' },
  { id: 'e5', title: "RHONEXPRESS LYON", amount: 19.90, category: 'reserved', date: '2026-07-25', note: 'Tram Aéroport' },
  { id: 'e6', title: "Aer Lingus Flight", amount: 340.22, category: 'reserved', date: '2026-07-25', note: 'Vols Aller/Retour' },
  { id: 'e7', title: "Booking.com Hotel", amount: 327.41, category: 'reserved', date: '2026-07-25', note: 'Logement aparto' }
];

export default function DashboardTab({ userProfile }) {
  // Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [tripState, setTripState] = useState('before'); // 'before', 'ongoing', 'after'
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(1);

  // Weather State
  const [weather, setWeather] = useState({ temp: '--', desc: 'Chargement...', wind: '--', humidity: '--', emoji: '☁️', loading: false });

  // Expenses States
  const [expenses, setExpenses] = useState([]);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('on_site'); // 'reserved' | 'on_site'
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Chart refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const supabase = getSupabase();

  // Load Expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setExpensesLoading(true);
    let loaded = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('dublin_expenses')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data) {
          loaded = data;
        } else {
          // Table or fetch error: fallback to local storage
          const local = localStorage.getItem('dublin_expenses_list');
          if (local) loaded = JSON.parse(local);
        }
      } catch (err) {
        const local = localStorage.getItem('dublin_expenses_list');
        if (local) loaded = JSON.parse(local);
      }
    } else {
      const local = localStorage.getItem('dublin_expenses_list');
      if (local) loaded = JSON.parse(local);
    }

    // IF nothing was loaded (length is 0), check if the user intentionally cleared it
    if (loaded.length === 0) {
      const isCleared = localStorage.getItem('dublin_expenses_cleared') === 'true';
      if (!isCleared) {
        loaded = DEFAULT_EXPENSES;
        // Optionally seed Supabase in background if table exists but empty
        if (supabase) {
          const seedData = DEFAULT_EXPENSES.map(e => ({
            title: e.title,
            amount: e.amount,
            category: e.category,
            date: e.date,
            note: e.note
          }));
          supabase.from('dublin_expenses').insert(seedData).catch(() => {});
        }
      }
    }

    setExpenses(loaded);
    setExpensesLoading(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;

    const newExpense = {
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      title: expenseTitle,
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: expenseDate,
      note: expenseNotes
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');

    if (supabase) {
      try {
        const { error } = await supabase.from('dublin_expenses').insert([
          { title: newExpense.title, amount: newExpense.amount, category: newExpense.category, date: newExpense.date, note: newExpense.note }
        ]);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem('dublin_expenses_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_expenses_list', JSON.stringify(updated));
    }
  };

  const handleDeleteExpense = async (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);

    if (supabase) {
      try {
        await supabase.from('dublin_expenses').delete().eq('id', id);
      } catch (err) {
        localStorage.setItem('dublin_expenses_list', JSON.stringify(updated));
      }
    } else {
      localStorage.setItem('dublin_expenses_list', JSON.stringify(updated));
    }
  };

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

  // 2. Budget Chart Initialization (reactive to expenses changes)
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const totalReserved = expenses.filter(e => e.category === 'reserved').reduce((acc, e) => acc + e.amount, 0);
      const totalOnSite = expenses.filter(e => e.category === 'on_site').reduce((acc, e) => acc + e.amount, 0);

      const isLight = document.body.classList.contains('light');

      chartInstance.current = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Réservé', 'Sur place'],
          datasets: [{
            data: [totalReserved, totalOnSite],
            backgroundColor: ['#10b981', '#fbbf24'],
            borderWidth: 2,
            borderColor: isLight ? '#ffffff' : '#030712',
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
  }, [expenses]);

  // 3. Weather Fetch
  const fetchWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=53.3498&longitude=-6.2603&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Europe/Dublin");
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const cur = data.current;

      const codeMapping = {
        0: { desc: 'Ciel Dégagé', emoji: '☀️' },
        1: { desc: 'Principalement Dégagé', emoji: '🌤️' },
        2: { desc: 'Partiellement Nuageux', emoji: '⛅' },
        3: { desc: 'Couvert', emoji: '☁️' },
        45: { desc: 'Brouillard', emoji: '🌫️' },
        48: { desc: 'Brouillard givrant', emoji: '🌫️' },
        51: { desc: 'Bruine Légère', emoji: '🌦️' },
        53: { desc: 'Bruine Modérée', emoji: '🌦️' },
        55: { desc: 'Bruine Dense', emoji: '🌦️' },
        61: { desc: 'Pluie Faible', emoji: '🌧️' },
        63: { desc: 'Pluie Modérée', emoji: '🌧️' },
        65: { desc: 'Pluie Forte', emoji: '🌧️' },
        80: { desc: 'Averses Faibles', emoji: '🌦️' },
        81: { desc: 'Averses Modérées', emoji: '🌦️' },
        82: { desc: 'Averses Violentes', emoji: '🌧️' }
      };

      const mapped = codeMapping[cur.weather_code] || { desc: 'Nuageux', emoji: '☁️' };

      setWeather({
        temp: `${cur.temperature_2m.toFixed(0)}°C`,
        desc: mapped.desc,
        wind: `${cur.wind_speed_10m.toFixed(0)} km/h`,
        humidity: `${cur.relative_humidity_2m}%`,
        emoji: mapped.emoji,
        loading: false
      });
    } catch (err) {
      setWeather({
        temp: '--',
        desc: 'Météo indisponible',
        wind: '--',
        humidity: '--',
        emoji: '⚠️',
        loading: false
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const totalReserved = expenses.filter(e => e.category === 'reserved').reduce((acc, e) => acc + e.amount, 0);
  const totalOnSite = expenses.filter(e => e.category === 'on_site').reduce((acc, e) => acc + e.amount, 0);
  const totalBudget = totalReserved + totalOnSite;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Cover */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 shadow-lg h-36">
        <img 
          src="./assets/dublin_banner.jpg" 
          alt="Dublin street illustration cover" 
          className="w-full h-full object-cover brightness-[0.7]" 
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
          <h2 className="text-overlay-white text-lg font-black text-white tracking-tight drop-shadow-md">Mon Dublin Express ☘️</h2>
          <p className="text-overlay-muted text-xs text-emerald-300 font-bold drop-shadow-sm">Mon Voyage • 6-12 Août 2026</p>
        </div>
      </div>

      {/* Main Grid: Left side details, Right side widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side (2 Columns on Desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Countdown Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900/60 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-800 hover:-translate-y-0.5">
            
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Plane className="w-4 h-4 animate-pulse" /> En cours de voyage !
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-450 border border-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">Jour {currentDayIndex} / 7</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-900/60 overflow-hidden p-0.5">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>Départ (06 Août)</span>
                    <span>{progressPercent.toFixed(0)}% effectué</span>
                    <span>Retour (12 Août)</span>
                  </div>
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
              <div className="w-28 h-28 flex-shrink-0">
                <canvas ref={chartRef}></canvas>
              </div>
              <div className="flex-grow space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Réservé
                  </span>
                  <span className="font-bold text-slate-200">{totalReserved.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Sur Place
                  </span>
                  <span className="font-bold text-slate-200">{totalOnSite.toFixed(2)} €</span>
                </div>
                <div className="h-px bg-slate-800/60 my-1"></div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-350">Total Séjour</span>
                  <span className="font-extrabold text-emerald-400">{totalBudget.toFixed(2)} €</span>
                </div>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowExpenseModal(true)}
              className="w-full text-center text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-slate-300 hover:text-slate-100 py-2.5 rounded-xl mt-4 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Gérer mes dépenses ({expenses.length})
            </button>
          </div>

        </div>

        {/* Right Side (1 Column on Desktop) */}
        <div className="space-y-6">
          
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
              <div className="flex items-center gap-3">
                <span className="text-4xl">{weather.emoji}</span>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-100">{weather.temp}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">{weather.desc}</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-450 space-y-0.5 font-medium">
                <p>💨 Vent : {weather.wind}</p>
                <p>💧 Humidité : {weather.humidity}</p>
              </div>
            </div>
          </div>

          {/* Quick flight details */}
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vol d'Aller</h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">EI 553</span>
                <p className="font-semibold text-slate-200 mt-1">Lyon (LYS) T1 ➔ Dublin (DUB)</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-400">06 Août</p>
                <p className="text-[9px] text-slate-500">Départ 09:00</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ==================== EXPENSE MANAGER MODAL ==================== */}
      {showExpenseModal && createPortal(
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">Grand Registre des Dépenses</h3>
              </div>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-850 text-slate-450 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-6 flex-grow">
              
              {/* Add Expense Form (Admin Only) */}
              {userProfile?.is_admin && (
                <form onSubmit={handleAddExpense} className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-4 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Enregistrer un nouveau paiement
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Libellé / Titre de la dépense</label>
                      <input 
                        type="text"
                        placeholder="Ex: Pub The Temple Bar, Guinness Storehouse..."
                        value={expenseTitle}
                        onChange={(e) => setExpenseTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Montant (€)</label>
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="Ex: 22.50"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Type de dépense</label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-2 py-2 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="reserved">Réservé (Avant départ)</option>
                        <option value="on_site">Sur place (Dublin)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date du paiement</label>
                      <input 
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Commentaire / Notes (Optionnel)</label>
                      <input 
                        type="text"
                        placeholder="Ex: Payé par carte"
                        value={expenseNotes}
                        onChange={(e) => setExpenseNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    Ajouter au budget
                  </button>
                </form>
              )}

              {/* Ledger List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Historique des transactions
                  </h4>
                  <span className="text-[9px] font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-400">Total : {expenses.length} dépenses</span>
                </div>

                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                  {expenses.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-500">Aucune dépense enregistrée.</p>
                  ) : (
                    expenses.map((exp) => (
                      <div key={exp.id} className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex items-center justify-between gap-4 hover:border-slate-850 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${exp.category === 'reserved' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-450 border border-amber-500/10'}`}>
                              {exp.category === 'reserved' ? "Réservé" : "Sur place"}
                            </span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> {new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-200 truncate">{exp.title}</p>
                          {exp.note && <p className="text-[10px] text-slate-500 italic truncate">{exp.note}</p>}
                        </div>

                        <div className="flex items-center gap-3.5 flex-shrink-0">
                          <span className="text-xs font-black text-rose-400">-{exp.amount.toFixed(2)} €</span>
                          {userProfile?.is_admin && (
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 bg-slate-950 border border-slate-900 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer la dépense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/60 flex items-center justify-between text-xs">
              <div className="flex gap-4">
                <div>
                  <p className="text-slate-500 font-semibold text-[8px] uppercase tracking-wide">Sous-total Réservations</p>
                  <p className="font-extrabold text-emerald-400">{totalReserved.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold text-[8px] uppercase tracking-wide">Sous-total Sur Place</p>
                  <p className="font-extrabold text-amber-500">{totalOnSite.toFixed(2)} €</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Dépenses totales</p>
                <p className="text-sm font-black text-slate-100">{totalBudget.toFixed(2)} €</p>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
