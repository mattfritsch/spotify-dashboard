# Dette connue et idées

## Sécurité
- `VITE_SPOTIFY_CLIENT_SECRET` est embarqué dans le bundle (flux client-credentials). À déplacer côté serveur (ex. Firebase Function, forfait Blaze) ou à remplacer par le flux PKCE.

## À faire
- Connexion Spotify (PKCE) : importer albums sauvegardés, écoutes récentes, top artistes.
- Bouton pour supprimer un commentaire (la règle `delete` est déjà prête).
- Annulation (undo) à la suppression au lieu d'un simple `confirm`.
- Notifications push (FCM + backend) quand un ami ajoute un album.
- Résumé annuel partageable façon « Wrapped ».
- Extraits 30 s : Spotify ne renvoie plus `preview_url` pour beaucoup de titres, prévoir une autre source.
- Code-splitting : le bundle dépasse 500 kB (Firebase).
- Pas de tests automatisés.
