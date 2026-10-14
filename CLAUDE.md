# Spotify Dashboard

PWA mobile-first pour collectionner, noter et partager ses albums Spotify. UI en français.

**Stack :** Vite 7, React 19, TypeScript, Tailwind 4 + DaisyUI 5 (thème `spotifydark`), Firebase (Auth Google + Firestore), react-hot-toast, react-icons, vite-plugin-pwa.

## Commandes
- `npm run dev` : dev (sans clé Firebase → mode mock, seule la page de connexion s'affiche)
- `npm run build` : `tsc -b` + build (génère le service worker)
- `npm run lint` : ESLint (règles React Compiler strictes : pas de `Date.now()` ni d'écriture de ref pendant le rendu)
- `npm run preview` : tester la PWA / le service worker (inactif en dev)

## Variables d'environnement (`.env`)
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_CLIENT_SECRET`.

## Règles du projet
- Mobile d'abord : cibles tactiles ≥ 44px, `dvh` (jamais `vh` seul), `safe-top` / `safe-bottom` pour les encoches, rien qui dépende du hover.
- Les champs de formulaire sont forcés à 16px sur mobile dans `index.css` (évite le zoom iOS). Ne pas rebloquer le zoom dans le viewport.
- Navigation sans routeur : l'état `view` + `history.pushState` (voir `docs/architecture.md`). Toute fenêtre/feuille s'ouvre via `present()` et se ferme via `dismiss()`.
- Un seul `Toaster`, dans `App`.
- Garder les changements minimaux, pas d'abstraction sans besoin.

## Docs
- @docs/architecture.md : structure, navigation, historique, PWA
- @docs/features.md : fonctionnalités et où elles vivent
- @docs/firestore.md : modèle de données et règles de sécurité
- @docs/todo.md : dette connue et idées
