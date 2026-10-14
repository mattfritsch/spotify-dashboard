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
  wishlist?: boolean;
  note?: string;
  releaseYear?: number;
  lists?: string[];
}

export type AlbumFields = Partial<Pick<Album, 'wishlist' | 'note' | 'genre' | 'releaseYear' | 'lists'>>;

export interface Comment {
  id: string;
  uid: string;
  name: string;
  text: string;
  at: string;
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
  releaseYear?: number;
}

export interface SpotifySearchResult {
  spotifyId: string;
  name: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
}

export const GENRES = [
  'Afrobeats',
  'Alternative',
  'Blues',
  'Classique',
  'Country',
  'Drill',
  'Electro',
  'Folk',
  'Funk',
  'Hip-Hop',
  'House',
  'Indie',
  'Jazz',
  'K-Pop',
  'Latin',
  'Metal',
  'Pop',
  'Punk',
  'R&B',
  'Rap FR',
  'Rap US',
  'Reggae',
  'Rock',
  'Soul',
  'Trap',
  'Autre',
] as const;

export type Genre = (typeof GENRES)[number];

