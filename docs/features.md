# Fonctionnalités

| Fonctionnalité | Où |
|---|---|
| Ajout par recherche ou lien Spotify, case « À écouter plus tard » | `AddAlbumModal`, `services/spotify.ts` |
| Grille de pochettes, appui long = mode sélection | `AlbumGrid`, `AlbumCard` |
| Détail : note, favori, genre, listes, note perso, titres, extraits 30 s, partage, suppression | `AlbumDetailModal` |
| Recherche, tri (récents/attente, note, artiste, titre, sortie) | `App.tsx` (`filteredAlbums`) |
| Filtre par genre, renommage d'un genre | `GenreFilter`, `renameGenre` dans `App.tsx` |
| Listes thématiques (`album.lists`), filtre `# liste` | `AlbumDetailModal`, `BatchDialog`, `App.tsx` |
| « Surprends-moi » (album aléatoire de la liste affichée) | `surprise()` dans `App.tsx` |
| Actions en lot : genre, liste, déplacer, supprimer | `SelectionBar`, `BatchDialog` |
| Onglet « À écouter » + rappel après 14 jours | `App.tsx` (`staleAlbum`, `STALE_DAYS`) |
| Année de sortie, stat par décennie, complétion en arrière-plan | `StatsView`, effet `backfilled` dans `App.tsx` |
| Stats (genres, notes, par année) | `StatsView` |
| Export JSON/CSV, import JSON (sans doublons `spotifyId`+liste) | `lib/backup.ts`, `ProfileModal` |
| Suivre, fil d'activité, profil public | `FollowingPanel`, `PublicProfileView` |
| Compatibilité (50 % albums communs, 50 % goûts) + albums en commun | `lib/compat.ts`, `PublicProfileView` |
| J'aime et commentaires sur l'album d'un ami | `FriendAlbumSheet`, `services/firestore.ts` |
| Barre d'onglets mobile (Albums, Stats, +, Suivis, Profil) | `BottomNav` |
