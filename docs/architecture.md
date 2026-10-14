# Architecture

## Structure `src/`
- `App.tsx` : tout l'état d'écran (`Main`), orchestration, `Toaster`. Pas de routeur.
- `components/` : `AlbumGrid`, `AlbumCard`, `AlbumDetailModal`, `AddAlbumModal`, `ProfileModal`, `BottomNav`, `SelectionBar`, `BatchDialog`, `GenreFilter`, `GenreSelect`, `StatsView`, `FollowingPanel`, `PublicProfileView`, `FriendAlbumSheet`, `Navbar`, `AlbumCover`.
- `hooks/` : `useAuth` (Google + purge du cache à la déconnexion), `useAlbums` (abonnement temps réel + toutes les mutations), `useProfile`.
- `services/` : `firestore.ts` (toutes les requêtes), `spotify.ts` (API Spotify).
- `lib/` : `firebase.ts` (init + cache hors-ligne), `backup.ts` (export/import), `compat.ts` (compatibilité entre deux collections).
- `types/index.ts` : `Album`, `AlbumFields`, `UserProfile`, `Comment`, liste `GENRES`.

## Navigation et historique
Chaque entrée d'historique porte `{ view, uid, idx, modal? }` :
- `go(view, uid?)` : change d'écran (ignore si identique à l'entrée courante).
- `goBack(fallback)` : `history.back()` si `idx > 0`, sinon remplace l'entrée (ne quitte jamais la PWA).
- `present(open)` / `dismiss()` : une feuille (détail, ajout, profil, lot) est une entrée d'historique, le geste retour la ferme.
- `popstate` ferme toutes les feuilles puis restaure `view`.

## Données
- `useAlbums` expose `albums` (tout), `collection` (hors wishlist), `genres`, `lists`, `handleUpdate`, `handleBatchUpdate`, `handleBatchDelete`, `handleImport`.
- Mode mock (`USE_MOCK`) quand `VITE_FIREBASE_API_KEY` est absent : les mutations modifient un état local.
- Les genres et les listes sont dérivés des albums (pas de document dédié) : renommer = mise à jour en lot.

## PWA
- `vite-plugin-pwa` (`registerType: autoUpdate`), `manifest: false` : le manifeste est `public/manifest.json`.
- Cache `CacheFirst` des pochettes `i.scdn.co` (300 entrées, 30 jours).
- Firestore : `persistentLocalCache` + multi-onglets ; vidé (`terminate` + `clearIndexedDbPersistence`) à la déconnexion.
- Icônes : `icon-192/512.png` (any), `icon-maskable-192/512.png` (marges de sécurité), `apple-touch-icon.png`. Régénérer avec ImageMagick (`magick -background none -density 384 icon.svg -resize 512x512 icon-512.png`).
- Share Target (GET `/` avec `url`/`text`) : un lien d'album Spotify partagé vers l'app ouvre la fenêtre d'ajout préremplie. Actif seulement sur la PWA installée.

## Pièges
- ESLint (React Compiler) refuse `Date.now()` pendant le rendu (utiliser `useState(() => Date.now())`) et l'écriture de `ref.current` pendant le rendu (le faire dans un `useEffect`).
- `AlbumDetailModal` est monté seulement quand ouvert (clé = id d'album) ; la note est enregistrée au démontage.
- Les icônes PNG doivent être de vrais PNG (elles étaient du SVG renommé).
