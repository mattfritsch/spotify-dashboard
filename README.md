# 🎵 Spotify Dashboard

Application web pour organiser et noter vos albums Spotify préférés, avec un système de profils publics et de suivi entre utilisateurs.

## ✨ Fonctionnalités

- **Gestion d'albums** : Ajoutez vos albums préférés via lien Spotify ou recherche autocomplete
- **Notation** : Système de notation 5 étoiles pour chaque album
- **Organisation** : Filtrage par genre, statistiques (top genre, nombre d'albums)
- **Album favori** : Marquez un album comme favori et affichez-le sur votre profil
- **Profils publics** : Consultez les profils et collections d'autres utilisateurs
- **Système de suivi** : Liste de suivi privée pour suivre vos utilisateurs préférés
- **Authentification Google** : Connexion sécurisée via Firebase Auth
- **Design moderne** : Interface sombre inspirée de Spotify avec Tailwind CSS + DaisyUI

## 🛠️ Stack technique

- **React 19** + **TypeScript** + **Vite 7**
- **Firebase** (Firestore + Auth)
- **Tailwind CSS v4** + **DaisyUI 5**
- **Spotify Web API** (recherche d'albums)
- **React Hot Toast** (notifications)
- **React Icons**

## 🚀 Installation

```bash
# Cloner le repo
git clone <url>
cd spotify-dashboard

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir .env avec vos clés Firebase et Spotify

# Lancer en dev
npm run dev

# Build pour production
npm run build
```

## 🔑 Configuration

### Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Firestore** et **Authentication** (provider Google)
3. Copiez les clés de config dans `.env`

### Spotify API

1. Créez une app sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Copiez le **Client ID** et **Client Secret** dans `.env`

### Seed des données

Pour peupler Firestore avec des albums de test :

```bash
node scripts/seed.mjs VOTRE_FIREBASE_UID
```

## 📁 Structure

```
src/
├── components/       # Composants React
├── hooks/           # Custom hooks (useAuth, useProfile, useAlbums)
├── services/        # Services Firebase et Spotify
├── types/           # Types TypeScript
└── data/            # Données mock pour dev
```

## 🎨 Thème

Thème custom DaisyUI "spotifydark" avec :
- Couleur primaire : `#1DB954` (vert Spotify)
- Fond : `#0a0a0a` / `#141414` / `#1e1e1e`

## 📝 License

MIT
