CONTEXTE D'INITIALISATION POUR ANTIGRAVITY CLI

Projet : Dublin 2026 — Feuille de route & Dashboard Sécurisé
Utilisateur : Voyageur Solo (Clermont-Ferrand ➔ Lyon ➔ Dublin)
Dates du séjour : Du 6 au 12 août 2026 (7 jours / 6 nuits)

🎯 INSTRUCTIONS POUR L'AGENT IA (ANTIGRAVITY CLI)

Vous êtes l'assistant personnel et l'architecte logiciel de ce voyage à Dublin en 2026. L'utilisateur poursuit sa session avec vous via la CLI. Vous devez garder en mémoire l'intégralité des contraintes, de l'état d'avancement des réservations et des fichiers déjà générés dans le projet.

📊 1. ÉTAT DES RÉSERVATIONS ET BUDGET (Mise à jour finale)

Code d'accès Dashboard : 2026

Logement : aparto Binary Hub Apartments (Chambre + SDB privée) — 6 nuits (327,00 € - Tarif Mobile Booking).

Procédure de Départ : Check-out précoce à 03h30 le 12 août (Réception/Gardien 24h/24 ou Key Drop Box).

Vols Aer Lingus (EI 553 / EI 550) : Lyon (LYS) ↔ Dublin (DUB) Terminal 2 — 340,22 €.

Bagage soute : 10 kg (55 x 40 x 24 cm) enregistré au comptoir.

Bagage cabine : Petit sac personnel sous le siège (40 x 30 x 20 cm).

Navette Dublin Express 782 : 12,00 € A/R (Terminal 2 ↔ Usher's Quay à 3 min du logement).

Transports TER Clermont-Lyon : 22,00 € A/R.

Rhônexpress : 19,90 € A/R (Tarif Jeune 12-25 ans).

Visites réservées :

Book of Kells Experience (Trinity College) : 7 août à 12h30 (Tarif Étudiant 21,00 €).

Guinness Storehouse : 10 août (22,50 € tarif été).

Kilmainham Gaol : À tenter en libre réouverture J-28 / matin même.

Synthèse financière :

Total payé / réservé : 770,62 €

Budget sur place prévisionnel (TFI Leap, repas, pubs) : 230,00 €

Total général du séjour : 1 000,62 €

📁 2. STRUCTURE DES FICHIERS DU PROJET

L'application et la documentation sont constituées des fichiers suivants :

index.html : Single Page Application responsive (Tailwind CSS, Chart.js, API Geolocation Live Tracking, Skeleton Loading, Chiffrement par code PIN 2026, onglets Dashboard/Itinéraire/Album photos).

plan_voyage_dublin_2026.md : Feuille de route complète jour par jour (du J1 au J7) avec conseils pratiques et logistiques.

programme_google_calendar_dublin.ics : Export iCalendar prêt pour importation dans Google Calendar.

static.yml : Workflow GitHub Actions pour le déploiement automatique sur GitHub Pages (.github/workflows/static.yml).

REMEDE_PROMPT.md : Prompt pour régénérer l'application web si nécessaire.

💻 3. COMMANDE DE REPRISE SUR ANTIGRAVITY CLI

Pour lancer ou poursuivre cette session dans Antigravity CLI avec l'historique complet :

# Option A : Charger le fichier de contexte lors de la commande
antigravity --context CONTEXT_ANTIGRAVITY.md "Je souhaite modifier [votre demande ici]"

# Option B : Passer le contexte dans le prompt initial
cat CONTEXT_ANTIGRAVITY.md | antigravity


📝 4. RAPPEL DES DERNIÈRES ACTIONS EFFECTUÉES

Application sécurisée par PIN (2026) et intégration du tracking GPS en temps réel.

Prise en compte du bagage de 10 kg Aer Lingus et de la navette Terminal 2.

Clarification de la procédure de check-out précoce à 03h30 du matin à Binary Hub.

Génération du fichier .ics pour Google Calendar.