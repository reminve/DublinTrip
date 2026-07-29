import React, { useState } from 'react';
import { Download, ChevronDown, FileText, Calendar, Copy, Check, Info, ShieldCheck, MapPin, DollarSign } from 'lucide-react';

const FULL_ROADMAP_TEXT = `# 🇮🇪 FEUILLE DE ROUTE COMPLÈTE – DUBLIN 2026
**Voyage Solo – Rémi Neveu**
**Dates :** Du Jeudi 6 Août au Mercredi 12 Août 2026 (6 nuits)

---

## 📌 INFORMATIONS ESSENTIELLES & RÉSERVATIONS

### 🏨 Hébergement : Binary Hub - Aparto
* **Adresse :** Bonham Street, Dublin, Irlande
* **Téléphone :** +44 131 210 0050
* **N° de réservation Booking.com :** 5694634506
* **Code confidentiel :** 9401
* **Montant réglé :** 327,41 € (payé le 25/07/2026)
* **Type d'hébergement :** Chambre Double Privative avec Salle de Bains Privative (Cuisine / Séjour partagés)
* **Check-in :** Jeudi 6 août 2026 entre 19:00 et 20:00 (Demande spéciale approuvée)
* **Check-out :** Mercredi 12 août 2026 à 03:00 du matin (Approuvé par Kyla - Réception ouverte 24h/24, remise du badge au comptoir)

### ✈️ Vols : Aer Lingus
* **Vol Aller :** EI 553 – Jeudi 6 Août 2026
* **Vol Retour :** EI 550 – Mercredi 12 Août 2026
* **Terminal :** Terminal 2 (T2) de l'Aéroport de Dublin (Départ & Arrivée)
* **Prix total des vols :** 340,22 €
* **Politique Bagages Incluses :**
  * 1 petit sac personnel sous le siège (max. 40 x 30 x 20 cm).
  * 1 bagage en soute de 10 kg (max. 55 x 40 x 24 cm) – À déposer au comptoir d'enregistrement avant le passage de la sécurité.

### 🚌 Navette Aéroport : Dublin Express (Ligne 782)
* **Trajet :** Aéroport de Dublin (T2, Zone 21) ↔ Usher's Quay (à proximité de Binary Hub)
* **Tarif :** 12,00 € A/R (6,00 € l'aller + 6,00 € le retour)

---

## 📅 PROGRAMME DÉTAILLÉ DU SÉJOUR

### 🔹 J1 – Jeudi 6 Août : Arrivée & Installation
* **Après-midi / Soir :** Vol Aer Lingus EI 553 depuis Lyon jusqu'au Terminal 2 de Dublin.
* **Transfert :** Navette Dublin Express 782 depuis le T2 (Zone 21) jusqu'à l'arrêt Usher's Quay.
* **19h00 - 20h00 :** Check-in à Binary Hub - Aparto (Bonham Street).
* **Soirée :** Repérage du quartier, achats de provisions au supermarché voisin (Lidl/Tesco), première balade le long de la Liffey.

### 🔹 J2 – Vendredi 7 Août : Cœur Historique & Book of Kells
* **Matin :** Découverte du parc de St Patrick's Cathedral et de Christ Church Cathedral.
* **11h00 :** Visite de la Chester Beatty Library (Entrée gratuite, dans les jardins du château).
* **12h30 (RÉSERVÉ) :** Trinity Visit – Book of Kells Experience
  * Tarif réglé : 21,00 € (Tarif étudiant – présenter la carte d'étudiant physique).
  * Durée : ~90 min (Manuscrit du Book of Kells, Old Library Long Room & Exposition immersive Red Pavilion).
* **Après-midi :** Promenade sur Grafton Street et détente à St Stephen's Green.
* **Soirée :** Ambiance musicale dans Temple Bar.

### 🔹 J3 – Samedi 8 Août : Guinness & Culture
* **Matin (09h30 - 10h00 conseillé) :** Guinness Storehouse
  * Tarif prévisionnel : ~22,50 € (Astuce : 20 € sur le créneau de 9h30 ou -10% via le mail Dublin Express).
* **Après-midi :** Visite de 14 Henrietta Street (musée captivant de la vie géorgienne) ou du National Museum of Ireland (Collins Barracks) à 5 minutes de l'hébergement.
* **Soirée :** Dîner pub traditionnel et session de musique folk irlandaise.

### 🔹 J4 – Dimanche 9 Août : Nature & Phoenix Park
* **Matin :** Petit-déjeuner puis balade dans Phoenix Park (un des plus grands parcs urbains d'Europe). Visite des jardins de Farmleigh House et observation des daims en liberté.
* **Après-midi :** Visite des National Botanic Gardens de Glasnevin (accès gratuit, serres victoriennes).
* **Soirée :** Dîner relax au bord du Grand Canal.

### 🔹 J5 – Lundi 10 Août : Histoire & Patrimoine
* **Matin (09h15 - 09h30) :** Vérification sur le site officiel des billets de dernière minute pour la prison de Kilmainham Gaol.
  * Alternative si complet : Royal Hospital Kilmainham / IMMA (Irish Museum of Modern Art).
* **Après-midi :** Exploration des Docklands, traversée du Samuel Beckett Bridge et visite d'EPIC The Irish Emigration Museum.
* **Soirée :** Dernier coucher de soleil sur Ha'penny Bridge.

### 🔹 J6 – Mardi 11 Août : Excursion Côte & Préparatifs
* **Journée :** Trajet en DART (train cône) jusqu'au village de pêcheurs de Howth. Randonnée sur les falaises (Howth Cliff Walk) et dégustation de Fish & Chips au port.
* **Soirée :** Retour au logement, préparation de la valise de 10 kg, rangement de la chambre.

### 🔹 J7 – Mercredi 12 Août : Retour
* **03h00 :** Check-out nocturne au Binary Hub. Remise de la clé/badge à la réception (permanence 24h/24).
* **03h30 :** Prise de la navette Dublin Express 782 à Usher's Quay vers l'Aéroport (Terminal 2).
* **Vol Retour :** Aer Lingus EI 550 vers Lyon.

---

## 💶 RÉCAPITULATIF FINANCIER & BUDGET DU VOYAGE

| Postes de Dépense | Statut | Montant (€) |
| :--- | :--- | :---: |
| Vol Aer Lingus A/R (Bagage soute 10kg inclus) | Payé | 340,22 € |
| Hébergement Binary Hub (6 nuits) | Payé | 327,41 € |
| Navette Aéroport Dublin Express A/R | Payé / Bloqué | 12,00 € |
| Trinity Visit (Book of Kells - Étudiant) | Payé | 21,00 € |
| Sous-total Réservé & Payé | SÉCURISÉ | 700,63 € |
| Guinness Storehouse | À payer sur place | ~22,50 € |
| Transports locaux (DART / Bus) | À payer sur place | ~25,00 € |
| Restauration, Courses & Extras (6 jours) | Estimé | ~240,00 € |
| BUDGET GLOBAL PRÉVISIONNEL | TOTAL | ~988,13 € |

---

## 🧰 CONSEILS PRATIQUES & CHECKLIST

1. Adaptateur Prise : Prises de Type G (3 fiches carrées) nécessaires en Irlande.
2. Pièce d'Identité : Carte nationale d'identité ou Passeport en cours de validité + Carte d'étudiant physique pour l'entrée Trinity College.
3. Paiements : Les cartes bancaires sont acceptées partout (Apple Pay / Google Pay généralisés). Prévoir uniquement 20 € à 30 € en espèces au cas où.
`;

const ITINERARY_DATA = [
  {
    id: 1,
    day: "J1",
    date: "Jeudi 6 Août",
    title: "J1 – Jeudi 6 Août : Arrivée & Installation",
    subtitle: "Lyon (LYS) ➔ Dublin (DUB T2) ➔ Binary Hub",
    events: [
      { time: "Après-midi / Soir", desc: "Vol Aer Lingus EI 553 depuis Lyon (LYS) jusqu'au Terminal 2 de Dublin (DUB).", type: "flight", badge: "Vol EI 553" },
      { time: "Transfert", desc: "Navette Dublin Express 782 depuis le Terminal 2 (Zone 21) jusqu'à l'arrêt Usher's Quay.", type: "transport", badge: "12,00 € A/R" },
      { time: "19h00 - 20h00", desc: "Check-in à Binary Hub - Aparto (Bonham Street). Demande spéciale de 19h-20h approuvée.", type: "hotel", badge: "Réservé 327,41 €" },
      { time: "Soirée", desc: "Repérage du quartier, achats de provisions au supermarché voisin (Lidl/Tesco), première balade le long de la Liffey.", type: "walk" }
    ]
  },
  {
    id: 2,
    day: "J2",
    date: "Vendredi 7 Août",
    title: "J2 – Vendredi 7 Août : Cœur Historique & Book of Kells",
    subtitle: "Trinity Visit réservé & Temple Bar",
    events: [
      { time: "Matin", desc: "Découverte du parc de St Patrick's Cathedral et de Christ Church Cathedral.", type: "walk" },
      { time: "11h00", desc: "Visite de la Chester Beatty Library (Entrée gratuite, située dans les jardins du château).", type: "visit", badge: "Gratuit" },
      { time: "12h30 (RÉSERVÉ)", desc: "Trinity Visit – Book of Kells Experience (~90 min). Manuscrit, Old Library Long Room & Red Pavilion. Se munir de la carte d'étudiant physique.", type: "visit", badge: "Payé 21,00 €" },
      { time: "Après-midi", desc: "Promenade sur Grafton Street et pause détente à St Stephen's Green.", type: "walk" },
      { time: "Soirée", desc: "Ambiance festive et sessions musicales dans les pubs de Temple Bar.", type: "pub" }
    ]
  },
  {
    id: 3,
    day: "J3",
    date: "Samedi 8 Août",
    title: "J3 – Samedi 8 Août : Guinness & Culture",
    subtitle: "Guinness Storehouse & Musées historiques",
    events: [
      { time: "09h30 - 10h00", desc: "Visite de la Guinness Storehouse (~22,50 € sur place. Créneau recommandé 09h30 pour bénéficier du tarif à 20 € ou -10% via Dublin Express).", type: "visit", badge: "~22,50 €" },
      { time: "Après-midi", desc: "Visite du 14 Henrietta Street (vie géorgienne) OU du National Museum of Ireland (Collins Barracks) à 5 min à pied du logement.", type: "visit" },
      { time: "Soirée", desc: "Dîner dans un pub traditionnel et session de musique folk irlandaise.", type: "pub" }
    ]
  },
  {
    id: 4,
    day: "J4",
    date: "Dimanche 9 Août",
    title: "J4 – Dimanche 9 Août : Nature & Phoenix Park",
    subtitle: "Phoenix Park, Daims & Botanic Gardens",
    events: [
      { time: "Matin", desc: "Petit-déjeuner puis grande balade dans Phoenix Park (un des plus grands parcs urbains d'Europe). Jardins de Farmleigh House et daims en liberté.", type: "walk" },
      { time: "Après-midi", desc: "Visite des National Botanic Gardens de Glasnevin (Accès gratuit, magnifiques serres victoriennes).", type: "visit", badge: "Gratuit" },
      { time: "Soirée", desc: "Dîner relaxant au bord du Grand Canal.", type: "food" }
    ]
  },
  {
    id: 5,
    day: "J5",
    date: "Lundi 10 Août",
    title: "J5 – Lundi 10 Août : Histoire & Patrimoine",
    subtitle: "Kilmainham Gaol, Docklands & EPIC Museum",
    events: [
      { time: "09h15 - 09h30", desc: "Vérification sur le site officiel des billets de dernière minute pour la prison de Kilmainham Gaol (Alt: Royal Hospital Kilmainham / IMMA).", type: "visit", badge: "À vérifier" },
      { time: "Après-midi", desc: "Exploration des Docklands, traversée du Samuel Beckett Bridge et visite d'EPIC The Irish Emigration Museum.", type: "visit" },
      { time: "Soirée", desc: "Dernier coucher de soleil sur le mythique Ha'penny Bridge.", type: "walk" }
    ]
  },
  {
    id: 6,
    day: "J6",
    date: "Mardi 11 Août",
    title: "J6 – Mardi 11 Août : Excursion Côte & Préparatifs",
    subtitle: "Escapade côtière à Howth & préparation valise",
    events: [
      { time: "Journée", desc: "Trajet en DART (train cône) jusqu'au village de pêcheurs de Howth. Randonnée 'Howth Cliff Walk' et dégustation de Fish & Chips au port.", type: "transport", badge: "DART (~25 €)" },
      { time: "Soirée", desc: "Retour au Binary Hub, préparation de la valise de 10 kg pour l'enregistrement soute, rangement de la chambre.", type: "pack" }
    ]
  },
  {
    id: 7,
    day: "J7",
    date: "Mercredi 12 Août",
    title: "J7 – Mercredi 12 Août : Retour",
    subtitle: "Départ précoce 03h00 ➔ Vol retour Aer Lingus",
    events: [
      { time: "03h00", desc: "Check-out nocturne au Binary Hub. Remise de la clé/badge à la réception (Permanence 24h/24 confirmée par Kyla).", type: "hotel", badge: "Check-out 03h00" },
      { time: "03h30", desc: "Prise de la navette Dublin Express 782 à Usher's Quay en direction de l'Aéroport (Terminal 2).", type: "transport" },
      { time: "Vol Retour", desc: "Vol Aer Lingus EI 550 depuis le Terminal 2 de Dublin vers Lyon (LYS). Enregistrement soute 10kg avant sécurité.", type: "flight", badge: "Vol EI 550" }
    ]
  }
];

export default function ItineraryTab() {
  const [activeView, setActiveView] = useState('timeline'); // 'timeline' | 'document'
  const [openDay, setOpenDay] = useState(1);
  const [copied, setCopied] = useState(false);

  const toggleAccordion = (id) => {
    setOpenDay(openDay === id ? null : id);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(FULL_ROADMAP_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header & View Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('timeline')}
            className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeView === 'timeline'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Chronologie J1–J7
          </button>
          <button
            onClick={() => setActiveView('document')}
            className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeView === 'document'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Fichier Markdown (.md)
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <a 
            href="/plan_voyage_dublin_2026.md" 
            download="plan_voyage_dublin_2026.md"
            className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Télécharger plan_voyage_dublin_2026.md"
          >
            <Download className="w-3.5 h-3.5" /> Plan (.md)
          </a>
          <a 
            href="/programme_google_calendar_dublin.ics" 
            download="programme_google_calendar_dublin.ics" 
            className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
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
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Programme Jour par Jour</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-normal">
                6 - 12 Août 2026
              </span>
            </h3>
            <span className="text-[11px] text-slate-500">Cliquez pour déplier un jour</span>
          </div>

          {ITINERARY_DATA.map((day) => {
            const isOpen = openDay === day.id;
            return (
              <div 
                key={day.id} 
                className={`bg-slate-900/40 border rounded-2xl p-4 transition-all duration-300 ${
                  isOpen 
                    ? 'border-emerald-500/40 bg-slate-900/70 shadow-lg shadow-emerald-500/[0.03]' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div 
                  onClick={() => toggleAccordion(day.id)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                      isOpen 
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-900 text-emerald-400 border border-slate-800 group-hover:border-slate-700'
                    }`}>
                      {day.day}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                        {day.title}
                      </h4>
                      <p className="text-xs text-slate-400">{day.subtitle}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 group-hover:text-slate-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </div>
                
                {isOpen && (
                  <div className="mt-4 border-l-2 border-slate-800 pl-4 ml-4 space-y-4 text-sm">
                    {day.events.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                          evt.badge ? 'bg-emerald-400 shadow shadow-emerald-400/50' : 'bg-slate-600'
                        }`}></span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-400">
                            {evt.time}
                          </span>
                          {evt.badge && (
                            <span className="bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-emerald-500/30 text-emerald-300">
                              {evt.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-medium mt-1 text-slate-200 text-xs sm:text-sm leading-relaxed">
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

      {/* VIEW 2: COMPREHENSIVE MARKDOWN FILE PREVIEW */}
      {activeView === 'document' && (
        <div className="space-y-4">
          {/* File Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">plan_voyage_dublin_2026.md</h3>
                <p className="text-xs text-slate-400">Feuille de route complète et officielle • Créé le 25/07/2026</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyText}
                className="flex-1 sm:flex-none text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié !" : "Copier le texte"}
              </button>
              <a
                href="/plan_voyage_dublin_2026.md"
                download="plan_voyage_dublin_2026.md"
                className="flex-1 sm:flex-none text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger
              </a>
            </div>
          </div>

          {/* Rendered Document Body */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 sm:p-7 space-y-6 text-slate-300 font-sans leading-relaxed text-sm shadow-inner">
            
            {/* Title Section */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Document Officiel</span>
                <span>•</span>
                <span>Voyage Solo Rémi Neveu</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                🇮🇪 FEUILLE DE ROUTE COMPLÈTE – DUBLIN 2026
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                <strong className="text-slate-200">Dates :</strong> Du Jeudi 6 Août au Mercredi 12 Août 2026 (6 nuits)
              </p>
            </div>

            {/* Informations Essentielles */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-850 pb-2">
                <Info className="w-4 h-4 text-emerald-400" />
                📌 INFORMATIONS ESSENTIELLES & RÉSERVATIONS
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hébergement */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                      🏨 Binary Hub - Aparto
                    </h3>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                      327,41 € Payé
                    </span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li><strong>Adresse :</strong> Bonham Street, Dublin, Irlande</li>
                    <li><strong>Téléphone :</strong> +44 131 210 0050</li>
                    <li><strong>Réservation Booking :</strong> 5694634506</li>
                    <li><strong>Code confidentiel :</strong> 9401</li>
                    <li><strong>Type :</strong> Chambre Double Privative avec SDB (Cuisine partagée)</li>
                    <li><strong>Check-in :</strong> Jeudi 6 août (19:00 - 20:00 - Demande spéciale approuvée)</li>
                    <li><strong>Check-out :</strong> Mercredi 12 août à 03:00 (Approuvé par Kyla - Réception 24h/24)</li>
                  </ul>
                </div>

                {/* Vols */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                      ✈️ Vols Aer Lingus
                    </h3>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                      340,22 € Payé
                    </span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li><strong>Vol Aller :</strong> EI 553 – Jeudi 6 Août 2026 (LYS ➔ DUB T2)</li>
                    <li><strong>Vol Retour :</strong> EI 550 – Mercredi 12 Août 2026 (DUB T2 ➔ LYS)</li>
                    <li><strong>Terminal :</strong> Terminal 2 (T2) Aéroport de Dublin</li>
                    <li><strong>Bagage Cabine :</strong> 1 petit sac sous le siège (40 x 30 x 20 cm)</li>
                    <li><strong>Bagage Soute :</strong> 1 bagage de 10 kg (55 x 40 x 24 cm) à déposer au comptoir</li>
                  </ul>
                </div>
              </div>

              {/* Navette */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    🚌 Navette Aéroport : Dublin Express (Ligne 782)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Trajet : Aéroport DUB (T2, Zone 21) ↔ Usher's Quay (à proximité immédiate de Binary Hub)
                  </p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded border border-emerald-500/20 whitespace-nowrap">
                  12,00 € A/R (Réservé)
                </span>
              </div>
            </div>

            {/* Programme Détaillé J1 - J7 */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-850 pb-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                📅 PROGRAMME DÉTAILLÉ DU SÉJOUR
              </h2>

              <div className="space-y-3">
                {ITINERARY_DATA.map((day) => (
                  <div key={day.id} className="bg-slate-900/30 border border-slate-850 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-slate-100 text-sm text-emerald-400">
                      {day.title}
                    </h3>
                    <div className="space-y-2 text-xs text-slate-300 pl-2">
                      {day.events.map((evt, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <span className="font-semibold text-slate-400 min-w-[120px]">{evt.time} :</span>
                          <span className="text-slate-200">{evt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tableau Financier */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-850 pb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                💶 RÉCAPITULATIF FINANCIER & BUDGET DU VOYAGE
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-xl">Postes de Dépense</th>
                      <th className="p-3 text-center">Statut</th>
                      <th className="p-3 text-right rounded-r-xl">Montant (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    <tr>
                      <td className="p-3 font-medium">Vol Aer Lingus A/R (Bagage soute 10kg inclus)</td>
                      <td className="p-3 text-center"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">Payé</span></td>
                      <td className="p-3 text-right font-bold text-slate-100">340,22 €</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Hébergement Binary Hub (6 nuits)</td>
                      <td className="p-3 text-center"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">Payé</span></td>
                      <td className="p-3 text-right font-bold text-slate-100">327,41 €</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Navette Aéroport Dublin Express A/R</td>
                      <td className="p-3 text-center"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">Payé</span></td>
                      <td className="p-3 text-right font-bold text-slate-100">12,00 €</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Trinity Visit (Book of Kells - Tarif Étudiant)</td>
                      <td className="p-3 text-center"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">Payé</span></td>
                      <td className="p-3 text-right font-bold text-slate-100">21,00 €</td>
                    </tr>
                    <tr className="bg-emerald-950/20 font-bold text-emerald-300">
                      <td className="p-3">Sous-total Réservé & Payé</td>
                      <td className="p-3 text-center"><span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold">SÉCURISÉ</span></td>
                      <td className="p-3 text-right font-black text-emerald-300">700,63 €</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Guinness Storehouse</td>
                      <td className="p-3 text-center"><span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-medium border border-amber-500/20">Sur place</span></td>
                      <td className="p-3 text-right text-slate-300">~22,50 €</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Transports locaux (DART / Bus)</td>
                      <td className="p-3 text-center"><span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-medium border border-amber-500/20">Sur place</span></td>
                      <td className="p-3 text-right text-slate-300">~25,00 €</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Restauration, Courses & Extras (6 jours)</td>
                      <td className="p-3 text-center"><span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-medium border border-amber-500/20">Estimé</span></td>
                      <td className="p-3 text-right text-slate-300">~240,00 €</td>
                    </tr>
                    <tr className="bg-slate-900 font-extrabold text-slate-100 text-sm">
                      <td className="p-3">BUDGET GLOBAL PRÉVISIONNEL</td>
                      <td className="p-3 text-center"><span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">TOTAL</span></td>
                      <td className="p-3 text-right text-emerald-400 font-mono text-base">~988,13 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checklist & Practical Info */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-850 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                🧰 CONSEILS PRATIQUES & CHECKLIST
              </h2>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2">
                <li><strong className="text-slate-100">Adaptateur Prise :</strong> Prises de Type G (3 fiches carrées) nécessaires en Irlande.</li>
                <li><strong className="text-slate-100">Pièce d'Identité :</strong> Carte nationale d'identité ou Passeport en cours de validité + Carte d'étudiant physique pour l'entrée Trinity College.</li>
                <li><strong className="text-slate-100">Paiements :</strong> Les cartes bancaires sont acceptées partout (Apple Pay / Google Pay généralisés). Prévoir uniquement 20 € à 30 € en espèces au cas où.</li>
              </ol>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
