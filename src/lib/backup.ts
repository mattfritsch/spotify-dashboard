import type { Album } from '../types';

type NewAlbum = Omit<Album, 'id'>;

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const day = () => new Date().toISOString().slice(0, 10);

export function exportJSON(albums: Album[]) {
  const data = albums.map((a) => {
    const rest: Partial<Album> = { ...a };
    delete rest.id;
    return rest;
  });
  download(`albums-${day()}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export function exportCSV(albums: Album[]) {
  const cols = ['name', 'artist', 'genre', 'rating', 'releaseYear', 'wishlist', 'lists', 'note', 'spotifyUrl', 'addedAt'] as const;
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = albums.map((a) => cols.map((c) => esc(c === 'lists' ? a.lists?.join('|') : a[c])).join(','));
  download(`albums-${day()}.csv`, [cols.join(','), ...rows].join('\n'), 'text/csv');
}

/** Parses a JSON export; invalid entries are dropped. */
export function parseImport(text: string): NewAlbum[] {
  const raw = JSON.parse(text);
  if (!Array.isArray(raw)) throw new Error('Fichier invalide');
  return raw
    .filter((a) => a && typeof a.spotifyId === 'string' && typeof a.name === 'string')
    .map((a) => ({
      spotifyId: a.spotifyId,
      name: a.name,
      artist: String(a.artist ?? ''),
      coverUrl: String(a.coverUrl ?? ''),
      spotifyUrl: String(a.spotifyUrl ?? `https://open.spotify.com/album/${a.spotifyId}`),
      genre: String(a.genre ?? 'Autre'),
      rating: typeof a.rating === 'number' ? a.rating : null,
      addedAt: String(a.addedAt ?? new Date().toISOString()),
      ...(a.wishlist && { wishlist: true }),
      ...(a.note && { note: String(a.note) }),
      ...(a.releaseYear && { releaseYear: Number(a.releaseYear) }),
      ...(Array.isArray(a.lists) && a.lists.length && { lists: a.lists.map(String) }),
    }));
}
