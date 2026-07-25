# ☘️ Dublin 2026 — Dashboard Voyage & Suivi Sécurisé

Ce projet contient une application web **Single Page (SPA)** responsive et **Mobile-First** conçue pour monitorer et documenter un voyage solo à Dublin du **6 au 12 août 2026**. 

L'application est construite sous **React + Vite** avec **Tailwind CSS v4** et est déployée gratuitement sur **GitHub Pages** (URL : https://reminve.github.io/DublinTrip/). Elle s'appuie sur un backend serverless **Supabase** (gratuit) pour gérer l'authentification sécurisée, la géolocalisation GPS en temps réel et un album photo privé, le tout protégé par des règles de sécurité **Row Level Security (RLS)**.

---

## 🚀 Fonctionnalités Clés

1.  **Authentification Privée (Supabase Auth) :** 
    *   Interface de connexion sécurisée (Email/Password) fonctionnant sur tous vos appareils.
    *   Système d'inscription publique mais bloqué par défaut. Seul l'administrateur (vous) peut approuver les comptes.
2.  **Tableau de Bord Voyageur & Registre Interactif (Budget) :**
    *   Compte à rebours dynamique avant le départ (ou barre de progression du voyage en cours).
    *   **Gestionnaire de budget dynamique :** Un graphique circulaire (Doughnut Chart) réactif affiche la répartition des dépenses (*Réservations pré-payées* vs *Sur place*).
    *   **Grand Registre des Dépenses :** Une fenêtre modale permet d'ajouter de nouvelles transactions (libellé, montant, date, notes) ou d'en supprimer. (Les ajouts et suppressions sont réservés aux Administrateurs, les invités ne peuvent que consulter).
    *   Résumés logistiques (vols Aer Lingus EI 553/550, logement aparto Binary Hub, check-out à 03h30).
    *   Météo en direct à Dublin via l'API publique et gratuite *Open-Meteo*.
3.  **Central d'Embarquement (Billets & Résas) :**
    *   Onglet dédié pour centraliser tous les titres de transport et réservations.
    *   **Portefeuille Google Wallet :** Boutons d'accès directs pour ajouter et ouvrir les cartes de fidélité ou d'embarquement sur votre téléphone.
    *   **Téléversement Admin :** Les administrateurs peuvent téléverser des documents PDF ou Images (captures d'écrans) qui sont convertis en Base64 côté client et sauvegardés directement dans la base de données.
    *   **Consultation & Téléchargement :** Tous les voyageurs approuvés peuvent consulter ou télécharger ces documents instantanément.
4.  **Feuille de Route & Itinéraire :**
    *   Timeline chronologique jour par jour rétractable (accordéons).
    *   Export de calendrier standard **Google Calendar (.ics)**.
5.  **Album Photo Privé :**
    *   Téléversement d'images avec **compression canvas côté client** (JPEG optimisé à ~50 Ko) pour économiser la base de données.
    *   Visionneuse d'images plein écran (Lightbox) et option de suppression.
6.  **Journal & Guinness Tracker :**
    *   Journal de bord partagé pour écrire les impressions au fil des jours.
    *   Compteur de Guinness en direct avec la possibilité de lister et noter les pubs visités (prix de la pinte, note sur 5 et commentaires).
7.  **Géolocalisation & Suivi Direct (Leaflet.js) :**
    *   Carte interactive en mode sombre (CartoDB Dark Matter).
    *   Bouton de tracking en direct (watchPosition) qui enregistre la trace GPS du voyageur.
    *   **Screen Wake Lock API :** Empêche l'appareil de se mettre en veille lorsque le GPS est actif, forçant le navigateur à continuer d'émettre pendant les déplacements.
    *   Simulateur de déplacement intégré pour tester l'application depuis chez soi.
8.  **Interface Administrateur & Sécurité :**
    *   **Gestion des utilisateurs :** Permet d'approuver ou de supprimer les demandes de création de comptes, ou encore de **promouvoir d'autres comptes au statut Admin** via une simple case à cocher.
    *   **Maintenance des données :** Outils d'administration en un clic pour vider l'historique GPS de test, réinitialiser le journal ou remettre le budget à zéro avant de décoller.
    *   **Ressources réservées :** L'ajout de dépenses et l'onglet *Réglages* sont masqués et interdits aux utilisateurs non-administrateurs.

---

## 📁 Structure du Projet

```text
├── .github/workflows/
│   └── static.yml         # Pipeline CI/CD de déploiement automatique sur GitHub Pages (Node 24)
├── app/                   # Code source de l'application modulaire React + Vite
│   ├── src/
│   │   ├── components/    # Composants React de chaque onglet (Dashboard, Map, Gallery, etc.)
│   │   ├── App.jsx        # Routage et contrôle de session principal
│   │   ├── index.css      # Directives Tailwind CSS v4.0 et surcharges mode clair/couleur d'accent
│   │   └── supabase.js    # Client de connexion à Supabase
│   ├── index.html         # Point d'entrée HTML de l'application React
│   └── package.json       # Dépendances npm et configurations
├── .gitignore             # Exclut les fichiers système et les billets d'avion PDF privés
├── plan_voyage_dublin_2026.md # Feuille de route logistique et jour-par-jour textuelle
├── programme_google_calendar_dublin.ics # Export de calendrier iCalendar
└── REMEDE_PROMPT.md       # Prompt d'initialisation de secours
```

---

## 🛠️ Installation & Démarrage Local

Pour exécuter le projet en local sur votre ordinateur :

### Prérequis
*   [Node.js](https://nodejs.org) (v24 recommandée) installé.

### Démarrage
1.  Entrez dans le dossier de l'application :
    ```bash
    cd app
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```
4.  Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`).
    *Note : L'exécution locale via un serveur de développement est obligatoire pour que le navigateur vous autorise à utiliser la puce GPS (Geolocation API).*

---

## ☁️ Configuration de la Base de Données Supabase

L'application utilise un projet Supabase gratuit pour stocker les profils, les trajets, les dépenses, les documents et les photos.

### 1. Initialisation des Tables & Règles RLS
Dans le **SQL Editor** de votre console Supabase, exécutez le script suivant pour configurer la base de données :

```sql
-- 1. Table des profils
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table du Suivi GPS
CREATE TABLE IF NOT EXISTS public.dublin_gps (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy REAL,
  alt REAL,
  speed REAL,
  user_id UUID DEFAULT auth.uid()
);

-- 3. Table de l'Album Photo
CREATE TABLE IF NOT EXISTS public.dublin_photos (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  image TEXT NOT NULL,
  user_id UUID REFERENCES auth.users DEFAULT auth.uid()
);

-- 4. Table du Journal de bord
CREATE TABLE IF NOT EXISTS public.dublin_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  emoji TEXT NOT NULL,
  user_id UUID DEFAULT auth.uid()
);

-- 5. Table du Compteur de Pintes
CREATE TABLE IF NOT EXISTS public.dublin_pints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pub TEXT NOT NULL,
  price NUMERIC(5,2) DEFAULT 0,
  rating INT DEFAULT 5,
  note TEXT,
  user_id UUID DEFAULT auth.uid()
);

-- 6. Table des Suggestions & Défis
CREATE TABLE IF NOT EXISTS public.dublin_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  text TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID DEFAULT auth.uid()
);

-- 7. Table des Documents & Billets
CREATE TABLE IF NOT EXISTS public.dublin_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'pdf', 'image', 'wallet'
  file_data TEXT, -- Base64 ou lien direct
  notes TEXT,
  user_id UUID DEFAULT auth.uid()
);

-- 8. Table des Dépenses & Budget
CREATE TABLE IF NOT EXISTS public.dublin_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  amount NUMERIC(8,2) NOT NULL,
  category TEXT NOT NULL, -- 'reserved', 'on_site'
  date DATE DEFAULT CURRENT_DATE,
  note TEXT,
  user_id UUID DEFAULT auth.uid()
);

-- Activation de RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_gps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_pints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_expenses ENABLE ROW LEVEL SECURITY;

-- 9. Politiques pour les profils
CREATE POLICY "Tout le monde peut s'inscrire" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Les membres connectés voient tous les profils" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Les admins modifient" ON public.profiles FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les admins suppriment" ON public.profiles FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- 10. Politiques pour le GPS
CREATE POLICY "Les admins écrivent GPS" ON public.dublin_gps FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les membres voient GPS" ON public.dublin_gps FOR SELECT USING ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true);

-- 11. Politiques pour l'Album Photo
CREATE POLICY "Les admins écrivent Photos" ON public.dublin_photos FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les membres voient Photos" ON public.dublin_photos FOR SELECT USING ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les admins suppriment Photos" ON public.dublin_photos FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- 12. Politiques pour le Journal
CREATE POLICY "Les admins écrivent Journal" ON public.dublin_journal FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les membres voient Journal" ON public.dublin_journal FOR SELECT USING ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les admins suppriment Journal" ON public.dublin_journal FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- 13. Politiques pour les Guinness & Pubs
CREATE POLICY "Les admins écrivent Pints" ON public.dublin_pints FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les membres voient Pints" ON public.dublin_pints FOR SELECT USING ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les admins suppriment Pints" ON public.dublin_pints FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- 14. Politiques pour les Suggestions & Défis
CREATE POLICY "Membres écrivent Suggestions" ON public.dublin_suggestions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Membres voient Suggestions" ON public.dublin_suggestions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Modif Suggestions" ON public.dublin_suggestions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Suppr Suggestions" ON public.dublin_suggestions FOR DELETE USING (auth.role() = 'authenticated');

-- 15. Politiques pour les Documents
CREATE POLICY "Les admins écrivent Documents" ON public.dublin_documents FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les membres voient Documents" ON public.dublin_documents FOR SELECT USING ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les admins suppriment Documents" ON public.dublin_documents FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- 16. Politiques pour les Dépenses
CREATE POLICY "Membres écrivent Dépenses" ON public.dublin_expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Membres voient Dépenses" ON public.dublin_expenses FOR SELECT USING ((SELECT approved FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Les admins suppriment Dépenses" ON public.dublin_expenses FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
```

### 2. Attribution du rôle Administrateur
Une fois inscrit sur votre application, attribuez-vous le rôle Admin en exécutant ceci dans l'éditeur SQL de Supabase :

```sql
UPDATE public.profiles 
SET approved = true, is_admin = true 
WHERE email = 'votre-email-de-connexion@exemple.com';
```

### 3. Gestion de la limite d'envoi de mails Supabase (Troubleshooting)
Sur l'offre gratuite de Supabase, la limite de mails de confirmation d'inscription est fixée à **2 mails par heure**. 
Si vous recevez l'erreur `email rate limit exceeded` lors de vos tests, vous devez faire une de ces deux actions :
*   **Recommandé pour tester rapidement :** Désactiver le besoin de confirmation e-mail. Allez dans **Authentication** 🔑 ➔ **Providers** ➔ **Email** et décochez **Confirm email** (ou *Double opt-in*). Les comptes créés seront actifs instantanément.
*   **Pour envoyer de vrais mails :** Configurez un SMTP gratuit externe (ex: [Resend](https://resend.com)) dans **Authentication** 🔑 ➔ **SMTP Settings**.

---

## 🚀 Déploiement GitHub Pages (CI/CD)

Le projet utilise GitHub Actions pour un déploiement continu à chaque Push.

1.  Assurez-vous d'avoir lié votre dépôt local à votre répertoire GitHub distant :
    ```bash
    git remote add origin https://github.com/reminve/DublinTrip.git
    git branch -M main
    git push -u origin main
    ```
2.  Configurez la source de publication :
    - Sur votre dépôt GitHub, allez dans **Settings** -> **Pages**.
    - Sous **Build and deployment** -> **Source**, sélectionnez **GitHub Actions**.
3.  À chaque modification, exécutez simplement :
    ```bash
    git add .
    git commit -m "Description de mes modifs"
    git push
    ```
    La pipeline compilera automatiquement l'application et la publiera sur `https://reminve.github.io/DublinTrip/`.
