import type { SpotifyAlbumData, SpotifySearchResult } from '../types';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Extracts the Spotify album ID from various link formats:
 * - https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE
 * - https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE?si=xxx
 * - spotify:album:6dVIqQ8qmQ5GBnJ9shOYGE
 */
export function extractAlbumId(input: string): string | null {
  const trimmed = input.trim();

  // Handle spotify URI format
  const uriMatch = trimmed.match(/spotify:album:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Handle URL format
  try {
    const url = new URL(trimmed);
    const pathMatch = url.pathname.match(/\/album\/([a-zA-Z0-9]+)/);
    if (pathMatch) return pathMatch[1];
  } catch {
    // Not a valid URL
  }

  // Handle raw album ID (22 chars alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;

  return null;
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Erreur Spotify:', errorData);
    throw new Error('Impossible de se connecter à Spotify');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // 1 min buffer
  console.log('✅ Token obtenu:', accessToken?.substring(0, 20) + '...');
  return accessToken!;
}

export async function fetchAlbumFromSpotify(albumId: string): Promise<SpotifyAlbumData> {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Album non trouvé sur Spotify');
    }
    throw new Error('Erreur lors de la récupération de l\'album');
  }

  const data = await response.json();

  // Get artist genres (album endpoint may not have genres, so we fetch artist)
  let genres: string[] = data.genres || [];
  if (genres.length === 0 && data.artists?.length > 0) {
    const artistResponse = await fetch(
      `https://api.spotify.com/v1/artists/${data.artists[0].id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (artistResponse.ok) {
      const artistData = await artistResponse.json();
      genres = artistData.genres || [];
    }
  }

  return {
    spotifyId: data.id,
    name: data.name,
    artist: data.artists.map((a: { name: string }) => a.name).join(', '),
    coverUrl: data.images?.[0]?.url || '',
    spotifyUrl: data.external_urls?.spotify || `https://open.spotify.com/album/${data.id}`,
    genres,
  };
}

export async function searchAlbums(queryStr: string, limit = 8): Promise<SpotifySearchResult[]> {
  if (!queryStr.trim()) return [];

  const token = await getAccessToken();
  const params = new URLSearchParams({
    q: queryStr,
    type: 'album',
    limit: String(limit),
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la recherche');
  }

  const data = await response.json();
  const albums = data.albums?.items || [];

  return albums.map((album: { id: string; name: string; artists: { name: string }[]; images: { url: string }[]; release_date: string }) => ({
    spotifyId: album.id,
    name: album.name,
    artist: album.artists.map((a) => a.name).join(', '),
    coverUrl: album.images?.[0]?.url || '',
    releaseDate: album.release_date || '',
  }));
}

