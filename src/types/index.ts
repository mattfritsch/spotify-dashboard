export interface Album {
  id: string;
  spotifyId: string;
  name: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string;
  genre: string;
  rating: number | null;
  addedAt: string;
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
  favoriteAlbumId: string | null;
}

export interface FollowEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  followedAt: string;
}

export interface SpotifyAlbumData {
  spotifyId: string;
  name: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string;
  genres: string[];
}

export interface SpotifySearchResult {
  spotifyId: string;
  name: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
}

export const GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'R&B',
  'Jazz',
  'Electronic',
  'Classical',
  'Metal',
  'Indie',
  'Folk',
  'Country',
  'Reggae',
  'Soul',
  'Funk',
  'Blues',
  'Latin',
  'Punk',
  'Alternative',
  'Rap',
  'K-Pop',
  'Afrobeats',
  'Autre',
] as const;

export type Genre = (typeof GENRES)[number];

