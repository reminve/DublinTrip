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
    title: "Jour 2 : Vendredi 7 août — Cœur Historique & Book of Kells",
    subtitle: "Cathédrales, Chester Beatty & Trinity Visit RÉSERVÉ",
    events: [
      { time: "09h30 – 11h00", desc: "Promenade extérieure vers Christ Church Cathedral et St Patrick's Cathedral.", type: "walk" },
      { time: "11h00 – 12h15", desc: "Entrée gratuite à la Chester Beatty Library (Jardins du Château de Dublin).", type: "visit", badge: "Gratuit" },
      { time: "12h30 (RÉSERVÉ)", desc: "Trinity Visit – Book of Kells Experience (21,00 €). Manuscrit, Old Library Long Room & Red Pavilion. Carte d'étudiant physique obligatoire.", type: "visit", badge: "Payé 21,00 €" },
      { time: "14h30 – 17h00", desc: "Flânerie sur Grafton Street et pause détente à St Stephen's Green.", type: "walk" },
      { time: "19h00", desc: "Soirée festive et musicale dans le quartier animé de Temple Bar.", type: "pub" }
    ]
  },
  {
    id: 3,
    day: "J3",
    date: "Samedi 8 Août",
    title: "Jour 3 : Samedi 8 août — Guinness & Culture",
    subtitle: "Guinness Storehouse, Musées & Pub Historique",
    events: [
      { time: "09h30 – 12h00", desc: "Guinness Storehouse (St James's Gate, à 8 min à pied). Visite des 7 étages et dégustation au Gravity Bar 360°.", type: "visit", badge: "~22,50 €" },
      { time: "13h30 – 16h30", desc: "Visite de 14 Henrietta Street (vie géorgienne) OU du National Museum – Collins Barracks (à 5 min du logement).", type: "visit" },
      { time: "20h00", desc: "Dîner au pub historique The Brazen Head (le plus ancien d'Irlande, situé à 4 min du logement).", type: "pub" }
    ]
  },
  {
    id: 4,
    day: "J4",
    date: "Dimanche 9 Août",
    title: "Jour 4 : Dimanche 9 août — Phoenix Park & Jardin Botanique",
    subtitle: "Cerfs sauvages, Farmleigh & Glasnevin",
    events: [
      { time: "09h00 – 12h00", desc: "Phoenix Park (à 12 min à pied de Binary Hub). Balade devant la résidence présidentielle et troupe de cerfs sauvages en liberté.", type: "walk", badge: "Gratuit" },
      { time: "13h30 – 16h30", desc: "National Botanic Gardens de Glasnevin (accès gratuit, serres victoriennes).", type: "visit", badge: "Gratuit" },
      { time: "18h00", desc: "Soirée au calme et dîner au bord du Grand Canal.", type: "food" }
    ]
  },
  {
    id: 5,
    day: "J5",
    date: "Lundi 10 Août",
    title: "Jour 5 : Lundi 10 août — Histoire & Docklands",
    subtitle: "Kilmainham Gaol attempt, Docklands & EPIC Museum",
    events: [
      { time: "09h15", desc: "Tentative d'achat de billets de dernière minute pour la prison historique de Kilmainham Gaol sur le site officiel.", type: "visit", badge: "~8,00 €" },
      { time: "11h00 – 16h00", desc: "Découverte des Docklands, traversée du pont Samuel Beckett et visite d'EPIC (Irish Emigration Museum).", type: "visit" },
      { time: "19h00", desc: "Balade photo au coucher du soleil autour du mythique Ha'penny Bridge.", type: "walk" }
    ]
  },
  {
    id: 6,
    day: "J6",
    date: "Mardi 11 Août",
    title: "Jour 6 : Mardi 11 août — Les Falaises de Howth & Préparatifs",
    subtitle: "Howth Cliff Walk, Fish & Chips & Préparation valise",
    events: [
      { time: "09h30 – 10h00", desc: "Train DART de Tara Street vers le village de pêcheurs de Howth.", type: "transport", badge: "DART (~25 €)" },
      { time: "10h15 – 13h30", desc: "Randonnée des Falaises de Howth (Howth Cliff Walk) au-dessus de la mer avec vues sur le Baily Lighthouse.", type: "walk" },
      { time: "13h30 – 15h00", desc: "Fish & Chips traditionnel sur le port de Howth.", type: "food" },
      { time: "18h30", desc: "Retour au logement, rangement du sac de soute (10 kg) et pré-réveil pour le départ nocturne.", type: "pack" }
    ]
  },
  {
    id: 7,
    day: "J7",
    date: "Mercredi 12 Août",
    title: "Jour 7 : Mercredi 12 août — Retour en France",
    subtitle: "Check-out 03h00 ➔ Navette 03h30 ➔ Vol T2 06h15 ➔ Lyon ➔ TER Clermont",
    events: [
      { time: "03h00", desc: "Check-out rapide à la réception 24h/24 de Binary Hub (remise du badge au gardien). Validé par Kyla.", type: "hotel", badge: "Check-out 03h00" },
      { time: "03h30", desc: "Prise de la navette Dublin Express 782 à l'arrêt Usher's Quay vers l'Aéroport (T2).", type: "transport" },
      { time: "04h00", desc: "Arrivée au Terminal 2 de l'Aéroport de Dublin. Dépose du bagage 10kg en soute.", type: "transport" },
      { time: "06h15 – 09h30", desc: "Vol Aer Lingus EI 550 Dublin T2 ➔ Lyon Saint-Exupéry.", type: "flight", badge: "Vol EI 550" },
      { time: "11h34 – 13h59", desc: "TER retour Lyon Part-Dieu ➔ Clermont-Ferrand. Fin du séjour !", type: "transport" }
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
            className="text-xs bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Télécharger plan_voyage_dublin_2026.md"
          >
            <Download className="w-3.5 h-3.5" /> Plan (.md)
          </a>
          <a 
            href="/programme_google_calendar_dublin.ics" 
            download="programme_google_calendar_dublin.ics" 
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 hover:text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Télécharger l'agenda Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar (.ics)
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

      {/* VIEW 2: CLEAN COMPREHENSIVE DOCUMENT PREVIEW (NO ENCART) */}
      {activeView === 'document' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 text-slate-200 font-sans leading-relaxed text-sm shadow-xl">
          
          {/* Header Title */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Feuille de Route & Plan de Voyage</span>
              <span>•</span>
              <span>Rémi Neveu (Solo)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              ✈️ CLERMONT-FERRAND ➔ DUBLIN
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
              <strong className="text-slate-100">Dates :</strong> Du 6 au 12 août 2026 (7 jours / 6 nuits) | <strong className="text-slate-100">Hébergement :</strong> aparto Binary Hub Apartments (Dublin 8)
            </p>
          </div>

          {/* Section 1: Récapitulatif Financier */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              📊 1. RÉCAPITULATIF FINANCIER & ÉCHÉANCIER DE PAIEMENT
            </h2>

            {/* Subtable A: Payé */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>💳 A. Réservations Payées / Effectuées</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">742,53 € Payé</span>
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left text-slate-200">
                  <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Poste de Dépense</th>
                      <th className="p-3">Détails & Logistique</th>
                      <th className="p-3 text-center">Montant</th>
                      <th className="p-3 text-right">Statut / Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Train Clermont ↔ Lyon</td>
                      <td className="p-3 text-slate-300">TER / Intercités A/R (09h02 Aller / 11h34 Retour)</td>
                      <td className="p-3 text-center font-bold text-slate-100">22,00 €</td>
                      <td className="p-3 text-right text-slate-300">SNCF Connect</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Rhônexpress Lyon ↔ LYS</td>
                      <td className="p-3 text-slate-300">Tram-train express (Tarif Jeune 12-25 ans A/R)</td>
                      <td className="p-3 text-center font-bold text-slate-100">19,90 €</td>
                      <td className="p-3 text-right text-slate-300">Rhônexpress</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Vol Aer Lingus A/R</td>
                      <td className="p-3 text-slate-300">Lyon (16h45) ↔ Dublin T2 (06h15) + Bagage 10kg soute + Petit sac cabine</td>
                      <td className="p-3 text-center font-bold text-slate-100">340,22 €</td>
                      <td className="p-3 text-right text-slate-300">EI 553 / EI 550</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Hébergement (6 nuits)</td>
                      <td className="p-3 text-slate-300">aparto Binary Hub (Chambre + SDB privée - Tarif Mobile)</td>
                      <td className="p-3 text-center font-bold text-slate-100">327,41 €</td>
                      <td className="p-3 text-right text-slate-300">Booking n° 5694634506 (Code: 9401)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Navette Aéroport A/R</td>
                      <td className="p-3 text-slate-300">Dublin Express 782 (Usher's Quay ↔ Terminal 2)</td>
                      <td className="p-3 text-center font-bold text-slate-100">12,00 €</td>
                      <td className="p-3 text-right text-slate-300">Dublin Express</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Visite Book of Kells</td>
                      <td className="p-3 text-slate-300">Trinity Visit (Book of Kells + Old Library + Red Pavilion) — 7 août @ 12h30</td>
                      <td className="p-3 text-center font-bold text-slate-100">21,00 €</td>
                      <td className="p-3 text-right text-slate-300">Billet Étudiant (Carte physique)</td>
                    </tr>
                    <tr className="bg-emerald-950/40 font-bold text-emerald-300">
                      <td className="p-3 font-extrabold text-slate-100">SUBTOTAL PAYÉ</td>
                      <td className="p-3 text-slate-200">Ensemble des prestations bloquées</td>
                      <td className="p-3 text-center font-extrabold text-emerald-300 text-sm">742,53 €</td>
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
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">255,50 € Estimé</span>
              </h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs text-left text-slate-200">
                  <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Poste de Dépense</th>
                      <th className="p-3">Détails & Logistique</th>
                      <th className="p-3 text-center">Montant Estimé</th>
                      <th className="p-3 text-right">Mode de Paiement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Visite Guinness Storehouse</td>
                      <td className="p-3 text-slate-300">Créneau matin (St James's Gate)</td>
                      <td className="p-3 text-center font-bold text-slate-100">22,50 €</td>
                      <td className="p-3 text-right text-slate-300">Sur place / En ligne</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Visite Kilmainham Gaol</td>
                      <td className="p-3 text-slate-300">Prison historique (Achat J-28 ou matin même 09h15)</td>
                      <td className="p-3 text-center font-bold text-slate-100">8,00 €</td>
                      <td className="p-3 text-right text-slate-300">En ligne</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Transports Locaux</td>
                      <td className="p-3 text-slate-300">Carte TFI Leap Visitor Card (DART Howth + Bus)</td>
                      <td className="p-3 text-center font-bold text-slate-100">25,00 €</td>
                      <td className="p-3 text-right text-slate-300">Borne Aéroport</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Excursion Glendalough</td>
                      <td className="p-3 text-slate-300">Car St. Kevin's Bus A/R</td>
                      <td className="p-3 text-center font-bold text-slate-100">25,00 €</td>
                      <td className="p-3 text-right text-slate-300">Chauffeur ou en ligne</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-100">Nourriture & Repas</td>
                      <td className="p-3 text-slate-300">Meal Deals midi (4,50 €/j) + Pubs & Snacks soir</td>
                      <td className="p-3 text-center font-bold text-slate-100">175,00 €</td>
                      <td className="p-3 text-right text-slate-300">Carte bancaire au fil des jours</td>
                    </tr>
                    <tr className="bg-slate-950 font-bold text-slate-200">
                      <td className="p-3 font-extrabold text-slate-100">SUBTOTAL SUR PLACE</td>
                      <td className="p-3 text-slate-300">Argent de poche du 6 au 12 août</td>
                      <td className="p-3 text-center font-extrabold text-amber-400 text-sm">255,50 €</td>
                      <td className="p-3 text-right text-slate-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Callout */}
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 flex justify-between items-center text-sm font-bold text-slate-100">
              <span>💰 TOTAL GLOBAL DU SÉJOUR (Tout compris) :</span>
              <span className="text-emerald-400 font-mono text-base sm:text-lg">~998,03 €</span>
            </div>
          </div>

          {/* Section 2: Procédures et préparatifs */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              📑 2. PROCÉDURES ET PRÉPARATIFS AVANT LE DÉPART
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">🪪 1. Papiers d'Identité & Carte Étudiant</h3>
                <p className="text-slate-300 text-xs">
                  <strong>Pièce d'identité :</strong> CNI ou Passeport en cours de validité (UE).<br />
                  <strong>Carte d'Étudiant PHYSIQUE :</strong> Indispensable à présenter le 7 août à 12h30 pour le tarif réduit 21,00 € au Book of Kells.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">💶 2. Monnaie & Carte Bancaire : EURO (€)</h3>
                <p className="text-slate-300 text-xs">
                  Euro (€) en République d'Irlande. Paiements sans contact / Apple Pay acceptés partout. Garder ~20 à 30 € liquides.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">🎒 3. Politique de Bagages Aer Lingus</h3>
                <p className="text-slate-300 text-xs">
                  <strong>1 Bagage de 10 kg soute (55x40x24 cm) :</strong> Déposer au comptoir enregistrement avant la sécurité.<br />
                  <strong>1 Petit Bagage sous le siège (40x30x20 cm) :</strong> À garder en cabine avec vous.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bold text-slate-100 text-xs mb-1">🔌 4. Adaptateur Électrique & 📱 5. Téléphone</h3>
                <p className="text-slate-300 text-xs">
                  Prises Type G (3 broches rectangulaires Irlande/UK). Roaming 4G/5G gratuit avec forfait français.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Logistique Hébergement */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Info className="w-4 h-4 text-emerald-400" />
              🏠 3. LOGISTIQUE HÉBERGEMENT (aparto Binary Hub)
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-200 space-y-1.5">
              <p><strong>Adresse :</strong> Roe Lane, Bonham Street, Dublin 8 (Quartier The Liberties)</p>
              <p><strong>N° Réservation Booking.com :</strong> 5694634506 | <strong>Code :</strong> 9401 | <strong>Tél :</strong> +44 131 210 0050</p>
              <p><strong>Check-in 6 août :</strong> Confirmé 19h00 – 20h00.</p>
              <p><strong>Check-out 12 août @ 03h00 du matin :</strong> Validé par Kyla. Réception ouverte 24h/24, remise du badge au comptoir.</p>
              <p><strong>Navette Dublin Express 782 :</strong> Arrêt Usher's Quay (3 min à pied), Terminal 2 (T2).</p>
            </div>
          </div>

          {/* Section 4: Itinéraire Résumé */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-850 pb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              🗓️ 4. ITINÉRAIRE DÉTAILLÉ DE A à Z
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
