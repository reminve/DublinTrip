# Prompt de Régénération - Dashboard Voyage Dublin 2026

Ce document sert de prompt d'initialisation rapide pour régénérer ou refondre l'application web mobile-first de suivi du voyage à Dublin en 2026. Il intègre tous les détails logistiques, financiers, de sécurité et techniques requis.

---

```text
Je souhaite créer ou régénérer une Single Page Application (SPA) responsive et Mobile-First pour monitorer mon voyage en solo à Dublin (du 6 au 12 août 2026). L'application doit être entièrement sécurisée par un code PIN d'accès "2026" pour protéger la galerie de photos et ma position de géolocalisation en temps réel.

Voici les spécifications détaillées pour la construction du fichier index.html :

1. ARCHITECTURE TECHNIQUE & FRAMEWORKS
- Style : Utiliser Tailwind CSS via CDN (version 4.0). Styles soignés, modernes, thématique sombre/sombre-hybride haut de gamme (gradients doux, effets de verre floutés - glassmorphism, micro-animations réactives, typographie sans-serif premium comme Inter via Google Fonts).
- Graphiques : Utiliser Chart.js (via CDN) pour afficher la synthèse budgétaire.
- Cartographie : Utiliser Leaflet.js (via CDN) pour la carte de suivi de position GPS en direct (OpenStreetMap gratuit, sans clé API requise).
- Gestion de données : Architecture "Local-First". Les photos ajoutées et l'historique GPS sont stockés dans le LocalStorage du navigateur par défaut. Fournir un onglet "Paramètres" (sécurisé) permettant à l'utilisateur de configurer ses propres clés Supabase/Firebase (API URL + Anon Key) pour sauvegarder les photos et la position live dans le cloud, sans exposer ces clés dans le code GitHub public.

2. SYSTEME DE SECURITE (LOGIN / LOCKSCREEN)
- Au chargement du site, afficher un écran de verrouillage élégant (lock screen) façon iOS/Android demandant un code PIN à 4 chiffres.
- Le code PIN d'accès est : 2026.
- Fournir un pavé numérique tactile réactif (numpad) avec des vibrations légères simulées (haptic micro-animations), un indicateur visuel de points saisis, et un message d'erreur si le PIN est incorrect.
- Une fois le PIN correct saisi, déverrouiller l'accès aux onglets du tableau de bord. Stocker l'état de déverrouillage dans SessionStorage pour éviter de retaper le code à chaque rechargement de page court.

3. STRUCTURE ET EN-TÊTES DE L'APPLICATION (5 ONGLETS PRINCIPAUX)

A. TABLEAU DE BORD (DASHBOARD)
- Compte à rebours dynamique en jours, heures, minutes et secondes avant le départ (Jeudi 6 août 2026 à 09h00, heure du TER de Clermont).
- Graphique circulaire (Doughnut) de répartition du budget : 770,62 € déjà payés/réservés vs 230,00 € restants pour le budget sur place (Total : 1 000,62 €).
- Section Résumé Rapide :
  * Logement : aparto Binary Hub Apartments (6 nuits - 327,00 €). Indiquer la procédure de check-out à 03h30 le 12 août (gardien 24/24 ou Key Drop Box).
  * Vols : Aer Lingus LYS ↔ DUB Terminal 2 (340,22 €). Rappel des bagages : 10 kg soute enregistré + petit sac cabine sous le siège.
  * Transports : TER (22,00 €), Rhônexpress (19,90 €), Dublin Express 782 (12,00 €).
- Widget météo en temps réel (ou mock avec possibilité de rafraîchir) pour Dublin.

B. FEUILLE DE ROUTE (ITINERAIRE)
- Timeline jour par jour (du J1 au J7, du 6 au 12 août 2026) sous forme d'accordéons interactifs élégants.
- Contenu détaillé par jour :
  * J1 (6 août) : Voyage Clermont-Ferrand -> Lyon -> Dublin. Vol Aer Lingus EI 553 (16h45 - 18h05). Navette Dublin Express 782 vers Usher's Quay. Check-in Binary Hub.
  * J2 (7 août) : Visite réservée du Book of Kells à 12h30 (Trinity College). Temple Bar.
  * J3 (8 août) : National Gallery (gratuit), Dublin Castle, Stephen's Green.
  * J4 (9 août) : Excursion DART vers Howth (Cliff Walk, Fish & chips).
  * J5 (10 août) : Visite réservée Guinness Storehouse à 14h00 ( Liberties, Gravity Bar).
  * J6 (11 août) : Phoenix Park + tentative d'accès libre Kilmainham Gaol (billets J-28 ou matin même).
  * J7 (12 août) : Départ matinal à 03h30. Dublin Express 782 à Usher's Quay (03h45) vers l'aéroport DUB Terminal 2. Vol retour EI 550 (06h15 - 09h30). Rhônexpress + TER vers Clermont.
- Option de téléchargement du fichier ICS pour Google Calendar.

C. ALBUM PHOTO (GALERIE PRIVÉE)
- Grille de photos responsive (masonry ou carrés harmonieux).
- Zone de téléversement (drag & drop ou sélecteur de fichier) permettant au voyageur d'ajouter de nouvelles photos directement depuis son téléphone.
- Les photos ajoutées sont stockées en Base64 dans LocalStorage, ou envoyées vers l'API de cloud privée si configurée (Supabase).
- Visualiseur d'image plein écran (Lightbox) au clic sur une photo avec option de suppression.

D. SUIVI LIVE (GÉOLOCALISATION GPS)
- Carte Leaflet interactive avec la position actuelle du voyageur dessinée par un marqueur personnalisé.
- Bouton "Activer le Tracking en Temps Réel" utilisant l'API Geolocation du navigateur (watchPosition).
- Affichage des coordonnées (Latitude, Longitude, Altitude, Précision) et de la dernière heure de mise à jour.
- Si le tracking est activé, tracer le chemin parcouru sur la carte.
- Si Supabase est configuré, envoyer la position en arrière-plan à intervalles réguliers.

E. PARAMÈTRES (SETTINGS)
- Configuration du stockage cloud :
  * Formulaire de configuration Supabase (URL du projet, Anon Key, Nom de la table).
  * Bouton de test de connexion.
- Gestion des données locales :
  * Espace occupé par les photos en LocalStorage.
  * Bouton "Effacer les données locales" (avec confirmation sécurisée).
- Informations sur l'application et crédits.

4. COMPORTEMENT ET SENSATIONS PREMIUM
- Skeleton Loaders lors du chargement des onglets et du graphique.
- États de survol (hover) soignés sur tous les boutons, ombres portées douces, coins arrondis généreux (rounded-2xl).
- Responsive parfait : l'application doit ressembler à une application native iOS/Android sur smartphone, tout en restant parfaitement lisible et esthétique sur ordinateur.
- Tout le code HTML, CSS et JavaScript doit être réuni dans un seul fichier index.html autonome et prêt pour un déploiement direct sur GitHub Pages.
```
