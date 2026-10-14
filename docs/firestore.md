# Firestore

## Modèle
- `users/{uid}` : profil `{ displayName, photoURL, favoriteAlbumId }`.
- `users/{uid}/albums/{id}` : `{ spotifyId, name, artist, coverUrl, spotifyUrl, genre, rating, addedAt, wishlist?, note?, releaseYear?, lists? }`.
- `users/{uid}/following/{targetUid}` : `{ uid, displayName, photoURL, followedAt }`.
- `users/{owner}/albums/{album}/likes/{likerUid}` : `{ at }`.
- `users/{owner}/albums/{album}/comments/{id}` : `{ uid, name, text (≤ 280), at }`.

Les albums en `wishlist` sont privés dans l'usage : exclus du profil public, du fil d'activité, des stats et de la compatibilité.

## Règles de sécurité (à publier dans la console Firebase)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /users/{owner}/albums/{album}/likes/{likerUid} {
      allow create, update, delete: if request.auth != null && request.auth.uid == likerUid;
    }

    match /users/{owner}/albums/{album}/comments/{commentId} {
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.text is string
        && request.resource.data.text.size() <= 280;
      allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
  }
}
```
Les règles s'additionnent : la règle générale autorise la lecture à tout utilisateur connecté et l'écriture au propriétaire ; les deux blocs ajoutés permettent aux amis de liker et commenter. Sans eux, la fiche affiche « Réactions indisponibles ».

## Notes
- Les lectures de commentaires utilisent `orderBy('at')` (pas d'index composite nécessaire).
- Les écritures en lot sont découpées par 400 (limite Firestore : 500).
