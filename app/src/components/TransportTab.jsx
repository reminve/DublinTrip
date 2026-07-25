import React, { useState, useEffect, useCallback } from 'react';
import {
  Plane, Train, Bus, Clock, MapPin, AlertCircle, CheckCircle2,
  RefreshCw, ExternalLink, ChevronRight, Navigation, Wifi, WifiOff
} from 'lucide-react';

// ─── Journey Data ──────────────────────────────────────────────────────────────
const JOURNEYS = {
  outbound: {
    label: 'Aller — 6 août 2026',
    date: '2026-08-06',
    legs: [
      {
        id: 'sncf-out',
        type: 'train',
        icon: '🚄',
        operator: 'SNCF',
        line: 'TGV Inouï',
        from: 'Domicile → Gare Part-Dieu',
        to: 'Lyon Part-Dieu',
        dep: '07:30',
        arr: '--',
        note: 'Vérifier horaire sur billet SNCF',
        statusLink: 'https://www.sncf-connect.com/app/trains/mes-voyages',
        color: 'indigo',
      },
      {
        id: 'rhonexpress-out',
        type: 'bus',
        icon: '🚌',
        operator: 'Rhônexpress',
        line: 'Tram-Train Express',
        from: 'Lyon Part-Dieu',
        to: 'Lyon-Saint-Exupéry T1 (LYS)',
        dep: '09:45',
        arr: '10:15',
        note: '~30 min — départ toutes les 15 min',
        statusLink: 'https://www.rhonexpress.fr/fr_FR/page/horaires',
        color: 'amber',
      },
      {
        id: 'ei553',
        type: 'flight',
        icon: '✈️',
        operator: 'Aer Lingus',
        flightNumber: 'EI 553',
        iata: 'EI553',
        icao24: 'EIN',
        from: 'Lyon Saint-Exupéry (LYS) T1',
        to: 'Dublin (DUB)',
        dep: '11:30',
        arr: '13:00',
        note: 'Heure locale Dublin (GMT+1) — 1h30 de vol',
        statusLink: 'https://www.aerlingus.com/my-booking/',
        fr24Link: 'https://www.flightradar24.com/flight/EI553',
        color: 'emerald',
      },
      {
        id: 'dublinexpress-out',
        type: 'bus',
        icon: '🚌',
        operator: 'Dublin Express',
        line: 'Airport Coach',
        from: 'Dublin Airport',
        to: 'City Centre (D\'Olier Street)',
        dep: 'À l\'arrivée',
        arr: '+35 min',
        note: 'Départs fréquents, pas de réservation',
        statusLink: 'https://www.dublinexpress.ie/',
        color: 'sky',
      },
    ]
  },
  return: {
    label: 'Retour — 12 août 2026',
    date: '2026-08-12',
    legs: [
      {
        id: 'dublinexpress-ret',
        type: 'bus',
        icon: '🚌',
        operator: 'Dublin Express',
        line: 'Airport Coach',
        from: 'City Centre (D\'Olier Street)',
        to: 'Dublin Airport',
        dep: '07:00',
        arr: '07:35',
        note: 'Départs fréquents, prévoir 2h avant vol',
        statusLink: 'https://www.dublinexpress.ie/',
        color: 'sky',
      },
      {
        id: 'ei550',
        type: 'flight',
        icon: '✈️',
        operator: 'Aer Lingus',
        flightNumber: 'EI 550',
        iata: 'EI550',
        icao24: 'EIN',
        from: 'Dublin (DUB)',
        to: 'Lyon Saint-Exupéry (LYS) T1',
        dep: '09:40',
        arr: '13:10',
        note: 'Heure locale Lyon (GMT+2) — 2h30 de vol',
        statusLink: 'https://www.aerlingus.com/my-booking/',
        fr24Link: 'https://www.flightradar24.com/flight/EI550',
        color: 'emerald',
      },
      {
        id: 'rhonexpress-ret',
        type: 'bus',
        icon: '🚌',
        operator: 'Rhônexpress',
        line: 'Tram-Train Express',
        from: 'Lyon-Saint-Exupéry T1 (LYS)',
        to: 'Lyon Part-Dieu',
        dep: 'À l\'arrivée',
        arr: '+30 min',
        note: '~30 min — départ toutes les 15 min',
        statusLink: 'https://www.rhonexpress.fr/fr_FR/page/horaires',
        color: 'amber',
      },
      {
        id: 'sncf-ret',
        type: 'train',
        icon: '🚄',
        operator: 'SNCF',
        line: 'TGV Inouï',
        from: 'Lyon Part-Dieu',
        to: 'Domicile',
        dep: '14:00',
        arr: '--',
        note: 'Vérifier horaire sur billet SNCF',
        statusLink: 'https://www.sncf-connect.com/app/trains/mes-voyages',
        color: 'indigo',
      },
    ]
  }
};

// ─── Color config ──────────────────────────────────────────────────────────────
const COLOR = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  dot: 'bg-indigo-400' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-400',     dot: 'bg-sky-400' },
};

// ─── Flight Status via OpenSky (free, no key) ──────────────────────────────────
async function fetchFlightStatus(iata, dateStr) {
  // Only query if today is the flight date (OpenSky only has live/recent data)
  const today = new Date().toISOString().split('T')[0];
  if (today !== dateStr) return null;

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const begin = Math.floor(new Date(year, month - 1, day, 0, 0, 0).getTime() / 1000);
    const end   = Math.floor(new Date(year, month - 1, day, 23, 59, 59).getTime() / 1000);

    // Query OpenSky for all Aer Lingus departures on this day from LYS or DUB
    const airport = iata.includes('553') ? 'LFLL' : 'EIDW'; // ICAO codes
    const url = `https://opensky-network.org/api/flights/departure?airport=${airport}&begin=${begin}&end=${end}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const flights = await res.json();

    // Find the matching flight by callsign (EIN553 or EIN550)
    const callsign = iata.replace(/\s/g, ''); // "EI553" → "EI553"
    const match = flights.find(f =>
      f.callsign && f.callsign.trim().toUpperCase().includes(callsign.replace('EI', 'EIN'))
    );

    if (!match) return { status: 'unknown', raw: null };

    const depTime = match.firstSeen ? new Date(match.firstSeen * 1000) : null;
    return {
      status: depTime ? 'departed' : 'scheduled',
      actualDep: depTime ? depTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null,
      raw: match
    };
  } catch {
    return null;
  }
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, isToday }) {
  if (!isToday) return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
      Programmé
    </span>
  );
  if (!status) return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 animate-pulse">
      Vérification...
    </span>
  );
  if (status.status === 'departed') return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
      <CheckCircle2 className="w-2.5 h-2.5" /> Décollé {status.actualDep && `à ${status.actualDep}`}
    </span>
  );
  return (
    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse">
      Données indisponibles
    </span>
  );
}

// ─── Flight Radar Embed ─────────────────────────────────────────────────────────
function FlightRadar({ leg }) {
  // Center map on Irish Sea
  const lat = 52.5, lon = -6.0;
  const src = `https://www.flightradar24.com/simple?lat=${lat}&lon=${lon}&z=6`;
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-b border-slate-800">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          🛰️ Radar live — Flightradar24
        </span>
        <a
          href={leg.fr24Link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> Suivre {leg.flightNumber}
        </a>
      </div>
      <iframe
        src={src}
        title="Flightradar24"
        className="w-full h-52 border-0"
        allow="fullscreen"
      />
    </div>
  );
}

// ─── Leg Card ──────────────────────────────────────────────────────────────────
function LegCard({ leg, journeyDate, isLast }) {
  const c = COLOR[leg.color] || COLOR.sky;
  const today = new Date().toISOString().split('T')[0];
  const isToday = today === journeyDate;
  const [status, setStatus] = useState(null);
  const [showRadar, setShowRadar] = useState(false);

  useEffect(() => {
    if (leg.type !== 'flight' || !isToday) return;
    fetchFlightStatus(leg.iata, journeyDate).then(setStatus);
    const iv = setInterval(() => fetchFlightStatus(leg.iata, journeyDate).then(setStatus), 120000);
    return () => clearInterval(iv);
  }, [leg.iata, journeyDate, isToday]);

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[23px] top-[52px] w-0.5 h-full bg-gradient-to-b from-slate-700 to-transparent z-0" />
      )}

      <div className={`relative z-10 card-premium p-4 border ${c.border} ${c.bg}`}>
        <div className="flex items-start gap-3">
          {/* Icon dot */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-950/60 border ${c.border} text-lg`}>
            {leg.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-extrabold ${c.text}`}>{leg.operator}</span>
                  {leg.flightNumber && (
                    <span className="text-[9px] font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300 font-mono">
                      {leg.flightNumber}
                    </span>
                  )}
                  {leg.line && !leg.flightNumber && (
                    <span className="text-[9px] text-slate-500 font-semibold">{leg.line}</span>
                  )}
                </div>
                {/* Route */}
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-300 font-semibold">
                  <span className="truncate">{leg.from}</span>
                  <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-600" />
                  <span className="truncate">{leg.to}</span>
                </div>
              </div>
              {/* Status badge */}
              {leg.type === 'flight' && (
                <StatusBadge status={status} isToday={isToday} />
              )}
            </div>

            {/* Time row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-200">
                  {leg.dep}
                  {leg.arr && leg.arr !== '--' && (
                    <span className="text-slate-500 font-normal"> → {leg.arr}</span>
                  )}
                </span>
              </div>
              {leg.type === 'flight' && isToday && status?.actualDep && (
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                  <Navigation className="w-2.5 h-2.5" />
                  Réel : {status.actualDep}
                </div>
              )}
            </div>

            {/* Note */}
            {leg.note && (
              <p className="text-[9px] text-slate-500 italic">{leg.note}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {/* Status / Booking link */}
              <a
                href={leg.statusLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                {leg.type === 'flight' ? 'Ma réservation' : leg.type === 'train' ? 'Mes billets SNCF' : 'Horaires'}
              </a>

              {/* Flight radar toggle */}
              {leg.type === 'flight' && leg.fr24Link && (
                <button
                  type="button"
                  onClick={() => setShowRadar(v => !v)}
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border ${
                    showRadar
                      ? 'bg-sky-500/20 border-sky-500/30 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-sky-400'
                  }`}
                >
                  🛰️ {showRadar ? 'Masquer radar' : 'Voir radar'}
                </button>
              )}

              {/* SNCF live status link */}
              {leg.type === 'train' && (
                <a
                  href="https://www.sncf-connect.com/app/trains/mes-voyages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  📍 Infos trafic
                </a>
              )}
            </div>

            {/* Radar embed */}
            {showRadar && leg.type === 'flight' && (
              <div className="mt-2">
                <FlightRadar leg={leg} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TransportTab() {
  const [direction, setDirection] = useState('outbound');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const journey = JOURNEYS[direction];
  const today = new Date().toISOString().split('T')[0];
  const isToday = today === journey.date;

  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date());
    // Force remount of leg cards by toggling direction briefly (hack-free: just update lastRefresh)
  }, []);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-900/80 shadow-lg h-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-50 flex items-center gap-2">
                <Plane className="w-5 h-5 text-emerald-400" /> Suivi des Transports
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Vols, trains et navettes — Lyon ↔ Dublin</p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
              {isToday
                ? <><Wifi className="w-3 h-3 text-emerald-400 animate-pulse" /><span className="text-emerald-400">Suivi live actif</span></>
                : <><WifiOff className="w-3 h-3" />Données programmées</>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Direction toggle */}
      <div className="flex gap-2 p-1 bg-slate-950/60 border border-slate-900 rounded-2xl">
        {Object.entries(JOURNEYS).map(([key, j]) => {
          const jDate = new Date(j.date + 'T12:00:00');
          const label = jDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          return (
            <button
              key={key}
              type="button"
              onClick={() => setDirection(key)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                direction === key
                  ? 'bg-emerald-500 text-slate-900 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {key === 'outbound' ? '✈️ Aller' : '🏠 Retour'}
              <span className={`block text-[9px] font-normal mt-0.5 ${direction === key ? 'text-slate-800' : 'text-slate-600'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live banner */}
      {isToday && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          C'est aujourd'hui ! Les statuts de vols se rafraîchissent automatiquement toutes les 2 minutes via OpenSky Network.
          <button type="button" onClick={handleRefresh} className="ml-auto text-emerald-400 hover:text-emerald-200 transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Journey timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Itinéraire complet
          </h3>
          <span className="text-[9px] text-slate-600">{journey.legs.length} étapes</span>
        </div>

        <div className="space-y-3">
          {journey.legs.map((leg, i) => (
            <LegCard
              key={`${leg.id}-${lastRefresh.getTime()}`}
              leg={leg}
              journeyDate={journey.date}
              isLast={i === journey.legs.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Info footer */}
      <div className="flex items-start gap-2 px-4 py-3 bg-slate-900/20 border border-slate-800/60 rounded-xl text-[9px] text-slate-500">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          Le suivi live des vols utilise <strong className="text-slate-400">OpenSky Network</strong> (gratuit, sans clé API) et n'est actif qu'au jour J du vol.
          Pour les trains SNCF, cliquez sur <strong className="text-slate-400">Infos trafic</strong> pour le suivi en temps réel sur l'application SNCF Connect.
        </span>
      </div>

    </div>
  );
}
