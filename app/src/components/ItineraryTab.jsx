import React, { useState } from 'react';
import { Download, ChevronDown, FileText, Calendar, Info, ShieldCheck, DollarSign } from 'lucide-react';

const ITINERARY_DATA = [
  {
    id: 1,
    day: "J1",
    date: "Jeudi 6 Août",
    title: "Jour 1 : Jeudi 6 août — Trajet & Installation",
    subtitle: "Clermont ➔ Lyon ➔ Dublin T2 ➔ Binary Hub",
    events: [
      { time: "09h02 – 11h26", desc: "TER Clermont-Ferrand ➔ Lyon Part-Dieu (22,00 € - SNCF Connect).", type: "transport", badge: "22,00 € Payé" },
      { time: "14h30 – 15h00", desc: "Tram Rhônexpress vers l'aéroport Saint-Exupéry (19,90 € - Tarif Jeune A/R).", type: "transport", badge: "19,90 € Payé" },
      { time: "16h45 – 18h05", desc: "Vol Aer Lingus EI 553 Lyon ➔ Dublin Terminal 2 (Bagage soute 10kg + Sac cabine).", type: "flight", badge: "Vol EI 553" },
      { time: "18h30 – 19h15", desc: "Récupération du bagage de soute et navette Dublin Express 782 (Zone 21).", type: "transport", badge: "12,00 € A/R" },
      { time: "19h30 – 19h40", desc: "Débarquement Usher's Quay, 3 min de marche. Check-in à aparto Binary Hub.", type: "hotel", badge: "Booking 327,41 €" },
      { time: "20h00", desc: "Courses de provisions au supermarché voisin et première balade relax le long de la Liffey.", type: "walk" }
    ]
  },
  {
    id: 2,
    day: "J2",
    date: "Vendredi 7 Août",
    title: "Jour 2 : Vendredi 7 Août 2026 – Centre Historique & Trinity Visit",
    subtitle: "Leap Card, Book of Kells RÉSERVÉ & Temple Bar",
    events: [
      { time: "Matin", desc: "Achat de la Leap Card au Centra. Petit-déjeuner en chemin (BeanHive).", type: "transport", badge: "Leap ~15 €" },
      { time: "09h30 – 12h15", desc: "Visites gratuites : National Gallery of Ireland (Merrion Square)", type: "visit", badge: "Gratuit" },
      { time: "12h30 (RÉSERVÉ)", desc: "Trinity Visit – Book of Kells Experience (21,00 €). Manuscrit, Old Library Long Room & Red Pavilion. ⚠️ Présenter la carte d'étudiant physique à l'entrée.", type: "visit", badge: "Payé 21,00 €" },
      { time: "Après-midi", desc: "Promenade sur Grafton Street, pause détente à St Stephen's Green / Iveagh Gardens, verre au Kavanagh's Pub.", type: "walk" },
      { time: "Soirée", desc: "Découverte de Temple Bar ou dîner tranquille.", type: "pub" }
    ]
  },
  {
    id: 3,
    day: "J3",
    date: "Samedi 8 Août",
    title: "Jour 3 : Samedi 8 Août 2026 – Randonnée à Howth & Domaine de Malahide",
    subtitle: "Howth Cliff Walk, Fish & Chips, Malahide Castle & The Brazen Head",
    events: [
      { time: "08h30 – 09h00", desc: "Départ du Binary Hub. Bus G1 (ou marche) jusqu'à Connolly/Tara St Station, puis train DART vers Howth (couvert par le forfait 2,00 € TFI / Leap Card).", type: "transport", badge: "DART (Leap)" },
      { time: "09h30 – 12h30", desc: "Randonnée des Falaises de Howth (Trace Komoot) : parcours littoral du Howth Cliff Walk avec vues spectaculaires sur la baie et le Baily Lighthouse.", type: "walk" },
      { time: "12h30 – 13h30", desc: "Pause repas / Fish & Chips traditionnel sur le port de pêche (Beshoff Bros ou Leo Burdock).", type: "food" },
      { time: "13h30 – 14h15", desc: "Trajet en Bus 102 direct (ou DART via Howth Junction) depuis Howth jusqu'à Malahide.", type: "transport" },
      { time: "14h30 – 17h00", desc: "Visite du parc, des jardins botaniques et de l'extérieur du Malahide Castle, promenade sur la marina et le front de mer.", type: "visit" },
      { time: "17h15 – 18h00", desc: "Retour en DART direct depuis Malahide vers le centre de Dublin.", type: "transport" },
      { time: "Soirée", desc: "Repas libre et verre dans un pub traditionnel historique (ex: The Brazen Head, fondé en 1198).", type: "pub" }
    ]
  },
  {
    id: 4,
    day: "J4",
    date: "Dimanche 9 Août",
    title: "Jour 4 : Dimanche 9 Août 2026 – Vallée Glaciaire & Lacs de Glendalough",
    subtitle: "Wicklow Mountains, Monastère du VIe s., Spinc Trail (9 km) & Upper Lake",
    events: [
      { time: "10h40", desc: "Présence à l'arrêt St. Stephen's Green North (Ligne St. Kevin's Bus 181, face au parc) pour assurer sa place.", type: "transport" },
      { time: "11h00", desc: "Départ du bus vers Glendalough (~15–20 € A/R auprès du chauffeur).", type: "transport", badge: "Bus ~20,00 €" },
      { time: "12h20", desc: "Arrivée au Glendalough Visitor Centre (~5h00 de temps libre sur place).", type: "visit" },
      { time: "12h20 – 13h00", desc: "Visite de la cité monastique (Tour ronde, ruines médiévales) et marche le long du Lower Lake vers l'Upper Lake.", type: "walk" },
      { time: "13h00 – 13h30", desc: "Pause pique-nique au bord de l'Upper Lake.", type: "food" },
      { time: "13h30 – 16h00", desc: "Randonnée du Spinc / White Route (Trace Komoot) : boucle de ~9 km (380 m D+) via Poulanass Waterfall, les passerelles en bois sur les crêtes et le Miner's Village.", type: "walk" },
      { time: "16h00 – 17h20", desc: "Redescente, pause boisson au Visitor Centre.", type: "food" },
      { time: "17h40", desc: "Bus retour depuis le Visitor Centre vers Dublin St. Stephen's Green.", type: "transport" },
      { time: "Soirée (19h00)", desc: "Arrivée vers 19h00 à Dublin, dîner libre et repos bien mérité.", type: "pub" }
    ]
  },
  {
    id: 5,
    day: "J5",
    date: "Lundi 10 Août",
    title: "Jour 5 : Lundi 10 Août 2026 – Phoenix Park, Collins Barracks & The Liberties",
    subtitle: "Pearse Lyons RÉSERVÉ, Guinness Storehouse RÉSERVÉ & Ha'penny Bridge",
    events: [
      { time: "08h30 – 10h45", desc: "Promenade matinale à Phoenix Park (Farmleigh House, observation des daims) puis visite du National Museum of Ireland – Decorative Arts & History à Collins Barracks (gratuit, juste en face du logement).", type: "walk", badge: "Gratuit" },
      { time: "11h00 (RÉSERVÉ)", desc: "Pearse Lyons Distillery Tour (121–125 James's Street). Visite guidée de la distillerie artisanale dans l'église St. James.", type: "visit", badge: "Payé 25,00 €" },
      { time: "12h30 – 13h30", desc: "Déjeuner libre dans le quartier de St James / Thomas Street.", type: "food" },
      { time: "13h30 (RÉSERVÉ)", desc: "Guinness Storehouse (St James's Gate). Expérience sur 7 étages et dégustation d'une pinte au Gravity Bar (vue à 360° sur tout Dublin).", type: "visit", badge: "Réservé ~22,50 €" },
      { time: "Soirée", desc: "Coucher de soleil au Ha'penny Bridge, balade au bord du fleuve et dîner libre.", type: "walk" }
    ]
  },
  {
    id: 6,
    day: "J6",
    date: "Mardi 11 Août",
    title: "Jour 6 : Mardi 11 Août 2026 – Dún Laoghaire & Musée d'Archéologie",
    subtitle: "East Pier, Forty Foot Sandycove, Bog Bodies & Préparation valise",
    events: [
      { time: "Matin", desc: "Trajet en DART vers la côte sud à Dún Laoghaire. Promenade sur la grande jetée (East Pier), vue sur la baie et marche littorale jusqu'au spot mythique de Forty Foot à Sandycove.", type: "walk", badge: "DART (Leap)" },
      { time: "Après-midi", desc: "Retour au centre de Dublin pour la visite du National Museum of Ireland – Archaeology (Kildare Street, entrée gratuite). Découverte des trésors d'or celtiques, de la Broche de Tara et des corps préservés des tourbières (Bog Bodies).", type: "visit", badge: "Gratuit" },
      { time: "Soirée", desc: "Retour au logement, bouclage des bagages (valise soute 10 kg) et repos avant le check-out nocturne.", type: "pack" }
    ]
  },
  {
    id: 7,
    day: "J7",
    date: "Mercredi 12 Août",
    title: "Jour 7 : Mercredi 12 Août 2026 – Départ Matinal",
    subtitle: "Check-out 03h00 ➔ Navette 03h30 ➔ Vol EI 550 vers Lyon",
    events: [
      { time: "03h00", desc: "Check-out au Binary Hub (remise du badge à la réception 24/7). Validé par Kyla.", type: "hotel", badge: "Check-out 03h00" },
      { time: "03h30", desc: "Navette Dublin Express 782 depuis Usher's Quay vers le Terminal 2 de l'Aéroport (Zone 21).", type: "transport" },
      { time: "04h00", desc: "Arrivée au Terminal 2 de l'Aéroport de Dublin. Dépose du bagage 10kg en soute et contrôle sécurité.", type: "transport" },
      { time: "06h15 – 09h30", desc: "Vol Aer Lingus EI 550 Dublin T2 ➔ Lyon Saint-Exupéry (LYS).", type: "flight", badge: "Vol EI 550" }
    ]
  }
];

export default function ItineraryTab() {
  const [activeView, setActiveView] = useState('timeline'); // 'timeline' | 'document'
  const [openDay, setOpenDay] = useState(1);

  const toggleAccordion = (id) => {
    setOpenDay(openDay === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* High-Contrast Header & View Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900 p-2.5 rounded-2xl border border-slate-700 shadow-md">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveView('timeline')}
            className={`flex-1 sm:flex-none text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeView === 'timeline'
                ? 'bg-emerald-500 text-white text-white-force shadow-md font-extrabold ring-2 ring-emerald-400/50'
                : 'text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Chronologie J1–J7
          </button>
          <button
            type="button"
            onClick={() => setActiveView('document')}
            className={`flex-1 sm:flex-none text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeView === 'document'
                ? 'bg-emerald-500 text-white text-white-force shadow-md font-extrabold ring-2 ring-emerald-400/50'
                : 'text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Document Complet (.md)
          </button>
        </div>

        <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
          <a 
            href="/plan_voyage_dublin_2026.md" 
            download="plan_voyage_dublin_2026.md"
            className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-white-force font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/50"
            title="Télécharger plan_voyage_dublin_2026.md"
          >
            <Download className="w-3.5 h-3.5" /> Plan (.md)
          </a>
          <a 
            href="/programme_google_calendar_dublin.ics" 
            download="programme_google_calendar_dublin.ics" 
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shadow-sm"
            title="Télécharger l'agenda Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Calendar (.ics)
          </a>
        </div>
      </div>

      {/* VIEW 1: TIMELINE CHRONOLOGIQUE */}
      {activeView === 'timeline' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Programme Jour par Jour</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                6 - 12 Août 2026
              </span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Cliquez pour déplier un jour</span>
          </div>

          {ITINERARY_DATA.map((day) => {
            const isOpen = openDay === day.id;
            return (
              <div 
                key={day.id} 
                className={`bg-slate-900 border rounded-2xl p-4 transition-all duration-200 ${
                  isOpen 
                    ? 'border-emerald-500/50 bg-slate-900 shadow-md ring-1 ring-emerald-500/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div 
                  onClick={() => toggleAccordion(day.id)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isOpen 
                        ? 'bg-emerald-500 text-white text-white-force font-extrabold shadow-sm' 
                        : 'bg-slate-950 text-emerald-400 border border-slate-700 group-hover:border-slate-600'
                    }`}>
                      {day.day}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                        {day.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">{day.subtitle}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 group-hover:text-white ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </div>
                
                {isOpen && (
                  <div className="mt-4 border-l-2 border-slate-700 pl-4 ml-4 space-y-3.5 text-sm">
                    {day.events.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                          evt.badge ? 'bg-emerald-400 shadow shadow-emerald-400/50' : 'bg-slate-500'
                        }`}></span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-300">
                            {evt.time}
                          </span>
                          {evt.badge && (
                            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500/40">
                              {evt.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-medium mt-1 text-slate-100 text-xs sm:text-sm leading-relaxed">
                          {evt.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CLEAN COMPREHENSIVE DOCUMENT PREVIEW */}
      {activeView === 'document' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 text-slate-200 font-sans leading-relaxed text-sm shadow-xl">
          
          {/* Header Title */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Feuille de Route</span>
              <span>•</span>
              <span>Rémi Neveu (Solo)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              ✈️ CLERMONT-FERRAND ➔ DUBLIN
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
              <strong className="text-slate-100">Dates :</strong> Du jeudi 6 août au mercredi 12 août 2026 (6 nuits) | <strong className="text-slate-100">Hébergement :</strong> aparto Binary Hub (Bonham Street, Dublin 8)
            </p>
          </div>

          {/* Section 1: Réservations Confirmées & Logistique */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              📌 1. RÉSERVATIONS CONFIRMÉES & LOGISTIQUE
            </h2>

            {/* Subtable A: Payé */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>💳 A. Prestations Payées / Bloquées</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">725,63 € Payé</span>
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left text-slate-200">
                  <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Prestation</th>
                      <th className="p-3">Prestataire / Lieu</th>
                      <th className="p-3">Détails & Identifiants</th>
                      <th className="p-3 text-center">Montant</th>
                      <th className="p-3 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Hébergement</td>
                      <td className="p-3 text-slate-300">Binary Hub - Aparto</td>
                      <td className="p-3 text-slate-300">Bonham Street, Dublin (N° 5694634506 | Code: 9401 | Tél: +44 131 210 0050) • Check-in: 06/08 19h-20h • Check-out: 12/08 03h00 (24/7)</td>
                      <td className="p-3 text-center font-bold text-slate-100">327,41 €</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">Payé</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Vols A/R</td>
                      <td className="p-3 text-slate-300">Aer Lingus</td>
                      <td className="p-3 text-slate-300">Terminal 2 (T2) • Aller EI 553 (06/08) | Retour EI 550 (12/08) • 1 petit sac sous le siège (40x30x20 cm) + 1 bagage soute 10 kg (55x40x24 cm)</td>
                      <td className="p-3 text-center font-bold text-slate-100">340,22 €</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">Payé</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Navette Aéroport</td>
                      <td className="p-3 text-slate-300">Dublin Express 782</td>
                      <td className="p-3 text-slate-300">A/R entre T2 (Zone 21) et Usher's Quay (à 3 min du logement)</td>
                      <td className="p-3 text-center font-bold text-slate-100">12,00 €</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">Payé</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Attraction 1</td>
                      <td className="p-3 text-slate-300">Trinity Visit (Book of Kells)</td>
                      <td className="p-3 text-slate-300">Vendredi 7 août 2026 à 12h30 • Manuscrit, Old Library Long Room & Red Pavilion ⚠️ Carte d'étudiant physique obligatoire</td>
                      <td className="p-3 text-center font-bold text-slate-100">21,00 €</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">Payé</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Attraction 2</td>
                      <td className="p-3 text-slate-300">Pearse Lyons Distillery</td>
                      <td className="p-3 text-slate-300">Lundi 10 août 2026 à 11h00 • Visite guidée dans l'église St. James (121–125 James's Street, à 3 min du logement)</td>
                      <td className="p-3 text-center font-bold text-slate-100">25,00 €</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">Payé</td>
                    </tr>
                    <tr className="bg-emerald-950/40 font-bold text-emerald-300">
                      <td className="p-3 font-extrabold text-slate-100" colSpan={3}>TOTAL DÉJÀ RÉGLÉ</td>
                      <td className="p-3 text-center font-extrabold text-emerald-300 text-sm">725,63 €</td>
                      <td className="p-3 text-right"><span className="bg-emerald-500 text-white text-white-force text-[10px] font-extrabold px-2 py-0.5 rounded">CONFIRMÉ</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subtable B: Sur Place */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>💵 B. Budget Prévisionnel Sur Place</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">~307,50 € Estimé</span>
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left text-slate-200">
                  <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Poste de Dépense</th>
                      <th className="p-3">Détails</th>
                      <th className="p-3 text-center">Montant Estimé</th>
                      <th className="p-3 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Guinness Storehouse</td>
                      <td className="p-3 text-slate-300">Réservé (10/08 à 13h30) • Gravity Bar 360°</td>
                      <td className="p-3 text-center font-bold text-slate-100">~22,50 €</td>
                      <td className="p-3 text-right text-amber-400 font-bold">À payer sur place</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Bus Glendalough A/R</td>
                      <td className="p-3 text-slate-300">Navette A/R Wicklow (St. Kevin's Bus 181)</td>
                      <td className="p-3 text-center font-bold text-slate-100">~20,00 €</td>
                      <td className="p-3 text-right text-slate-400">À prévoir</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Leap Card (Transports)</td>
                      <td className="p-3 text-slate-300">Pass DART + Bus locaux</td>
                      <td className="p-3 text-center font-bold text-slate-100">~25,00 €</td>
                      <td className="p-3 text-right text-slate-400">À acheter le 07/08</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Restauration & Courses</td>
                      <td className="p-3 text-slate-300">6 jours sur place (Meal deals, pubs & snacks)</td>
                      <td className="p-3 text-center font-bold text-slate-100">~240,00 €</td>
                      <td className="p-3 text-right text-slate-400">Estimé</td>
                    </tr>
                    <tr className="bg-slate-950 font-bold text-slate-200">
                      <td className="p-3 font-extrabold text-slate-100" colSpan={2}>SOUS-TOTAL SUR PLACE</td>
                      <td className="p-3 text-center font-extrabold text-amber-400 text-sm">~307,50 €</td>
                      <td className="p-3 text-right text-slate-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Callout */}
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 flex justify-between items-center text-sm font-bold text-slate-100">
              <span>💰 TOTAL ESTIMÉ DU SÉJOUR (Budget Global) :</span>
              <span className="text-emerald-400 font-mono text-base sm:text-lg">~1 033,13 €</span>
            </div>
          </div>

          {/* Section 2: Rappels Pratiques */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              🧰 4. RAPPELS PRATIQUES
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">🔌 Adaptateur électrique</h3>
                <p className="text-slate-300">Prises de Type G (3 broches carrées Irlande/UK).</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">🪪 Documents indispensables</h3>
                <p className="text-slate-300">CNI / Passeport + <strong>Carte d'étudiant physique</strong> (pour la réduction Trinity Book of Kells).</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">🚌 Bus Glendalough (Dimanche)</h3>
                <p className="text-slate-300">Arriver vers 10h40 à St. Stephen's Green North (face au parc) pour assurer sa place au départ de 11h00.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">📞 Contacts utiles</h3>
                <p className="text-slate-300">Réception Binary Hub (+44 131 210 0050) | Urgences Irlande (112 ou 999).</p>
              </div>
            </div>
          </div>

          {/* Section 3: Itinéraire Résumé */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-850 pb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              📅 2. ITINÉRAIRE DÉTAILLÉ JOUR PAR JOUR
            </h2>
            <div className="space-y-2">
              {ITINERARY_DATA.map((day) => (
                <div key={day.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 space-y-1">
                  <h3 className="font-bold text-emerald-400 text-xs sm:text-sm">{day.title}</h3>
                  {day.events.map((e, idx) => (
                    <p key={idx} className="text-slate-300">
                      <strong className="text-slate-100">{e.time} :</strong> {e.desc}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
