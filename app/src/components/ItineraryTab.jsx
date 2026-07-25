import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

const ITINERARY_DATA = [
  {
    id: 1,
    day: "J1",
    title: "Jeudi 6 août — Le Voyage",
    subtitle: "Clermont-Fd ➔ Lyon ➔ Dublin",
    events: [
      { time: "09:00 - 11:30", desc: "Train TER Clermont-Ferrand ➔ Lyon Part-Dieu", type: "transport" },
      { time: "12:30 - 13:10", desc: "Navette Rhônexpress Lyon Part-Dieu ➔ Aéroport LYS", type: "transport" },
      { time: "16:45 - 18:05", desc: "Vol Aer Lingus EI 553 LYS T1 ➔ Dublin (DUB) T2", type: "flight", badge: "Vol EI 553" },
      { time: "18:30 - 19:30", desc: "Navette Dublin Express 782 : Aéroport DUB ➔ Usher's Quay (3 min du logement)", type: "transport" },
      { time: "19:30", desc: "Check-in à aparto Binary Hub Apartments", type: "hotel", badge: "Réservé" }
    ]
  },
  {
    id: 2,
    day: "J2",
    title: "Vendredi 7 août — Trinity & Temple Bar",
    subtitle: "Book of Kells réservé",
    events: [
      { time: "Matinée", desc: "Balade à pied vers le centre, passage par Christ Church et Dublin Castle", type: "walk" },
      { time: "12:30", desc: "Book of Kells Experience & Long Room (Trinity College)", type: "visit", badge: "Visite Réservée" },
      { time: "Après-midi", desc: "Exploration de Grafton Street, Georges Street Arcade et Stephen's Green", type: "walk" },
      { time: "Soirée", desc: "Pubs traditionnels à Temple Bar, musique folklorique en live", type: "pub" }
    ]
  },
  {
    id: 3,
    day: "J3",
    title: "Samedi 8 août — Musées & Centre-ville",
    subtitle: "National Gallery (Entrée gratuite)",
    events: [
      { time: "Matinée", desc: "Visite de la National Gallery of Ireland (Gratuit)", type: "visit" },
      { time: "Midi", desc: "Déjeuner tranquille près de Merrion Square", type: "food" },
      { time: "Après-midi", desc: "Visite de la magnifique Saint Patrick's Cathedral et flânerie dans le Creative Quarter", type: "walk" }
    ]
  },
  {
    id: 4,
    day: "J4",
    title: "Dimanche 9 août — Escapade à Howth",
    subtitle: "Cliff Walk & Phoques sauvages",
    events: [
      { time: "09:30 - 10:00", desc: "Trajet en train DART depuis Connolly Station vers Howth (25 min)", type: "transport" },
      { time: "Midi", desc: "Fish & chips sur le port face aux bateaux", type: "food" },
      { time: "Après-midi", desc: "Randonnée 'Howth Cliff Walk' (falaises, vue sur la mer d'Irlande et phare de Baily)", type: "walk" },
      { time: "Fin d'après-midi", desc: "Observation des phoques sauvages dans le port avant le retour", type: "walk" }
    ]
  },
  {
    id: 5,
    day: "J5",
    title: "Lundi 10 août — Guinness Storehouse",
    subtitle: "L'expérience Guinness réservée",
    events: [
      { time: "Matinée", desc: "Visite historique des Liberties et de Christ Church", type: "walk" },
      { time: "14:00", desc: "Guinness Storehouse & pinte offerte avec vue 360° au Gravity Bar", type: "visit", badge: "Visite Réservée" },
      { time: "Après-midi", desc: "Balade le long de la Liffey et Docklands (pont Samuel Beckett)", type: "walk" },
      { time: "Soirée", desc: "Dîner au 'Brazen Head', plus ancien pub de Dublin", type: "pub" }
    ]
  },
  {
    id: 6,
    day: "J6",
    title: "Mardi 11 août — Prison & Phoenix Park",
    subtitle: "Kilmainham Gaol & Daims sauvages",
    events: [
      { time: "09:30", desc: "Kilmainham Gaol (Tentative de ticket J-28 à 9h00 ou de dernière minute le matin même)", type: "visit", badge: "À réserver" },
      { time: "Après-midi", desc: "Balade dans Phoenix Park, observation du troupeau de daims sauvages en liberté", type: "walk" },
      { time: "Soirée", desc: "Préparation du sac de 10 kg, rangement de l'appartement pour le départ", type: "pack" }
    ]
  },
  {
    id: 7,
    day: "J7",
    title: "Mercredi 12 août — Le Retour",
    subtitle: "Dublin ➔ Lyon ➔ Clermont-Fd",
    events: [
      { time: "03:30", desc: "Check-out de aparto Binary Hub. Dépôt des clés (Key Drop Box)", type: "hotel", badge: "Départ précoce" },
      { time: "03:45", desc: "Navette Dublin Express 782 depuis Usher's Quay ➔ Aéroport (T2)", type: "transport" },
      { time: "06:15 - 09:30", desc: "Vol retour Aer Lingus DUB T2 ➔ Lyon T1. Dépôt soute et passage sécurité.", type: "flight", badge: "Vol EI 550" },
      { time: "10:15 - 10:55", desc: "Navette Rhônexpress Aéroport LYS ➔ Lyon Part-Dieu", type: "transport" },
      { time: "12:00 - 14:30", desc: "Train TER Lyon Part-Dieu ➔ Clermont-Ferrand. Fin du voyage !", type: "transport" }
    ]
  }
];

export default function ItineraryTab() {
  const [openDay, setOpenDay] = useState(null);

  const toggleAccordion = (id) => {
    setOpenDay(openDay === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Feuille de Route & Programme</h3>
        <a 
          href="/programme_google_calendar_dublin.ics" 
          download 
          className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Google Calendar (.ics)
        </a>
      </div>

      <div className="space-y-3">
        {ITINERARY_DATA.map((day) => {
          const isOpen = openDay === day.id;
          return (
            <div 
              key={day.id} 
              className={`bg-slate-900/40 border border-slate-800 rounded-2xl p-4 transition-all ${isOpen ? 'ring-1 ring-emerald-500/30' : ''}`}
            >
              <div 
                onClick={() => toggleAccordion(day.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold">
                    {day.day}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{day.title}</h4>
                    <p className="text-xs text-slate-500">{day.subtitle}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </div>
              
              {isOpen && (
                <div className="mt-4 border-l border-slate-850 pl-4 ml-4 space-y-4 text-sm text-slate-300">
                  {day.events.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full ${evt.badge ? 'bg-emerald-400 shadow shadow-emerald-400/50' : 'bg-slate-700'}`}></span>
                      <p className="font-bold text-xs text-slate-400 flex items-center gap-1.5">
                        {evt.time}
                        {evt.badge && (
                          <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-emerald-500/20 text-emerald-400">
                            {evt.badge}
                          </span>
                        )}
                      </p>
                      <p className="font-medium mt-0.5">{evt.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
