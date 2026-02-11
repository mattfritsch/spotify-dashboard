import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaSearch, FaLink } from 'react-icons/fa';
import { extractAlbumId, fetchAlbumFromSpotify, searchAlbums } from '../services/spotify';
import { addAlbum } from '../services/firestore';
import { GENRES } from '../types';
import type { SpotifyAlbumData, SpotifySearchResult } from '../types';

interface AddAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
}

function matchGenre(spotifyGenres: string[]): string {
  const joined = spotifyGenres.join(' ').toLowerCase();
  for (const genre of GENRES) {
    if (joined.includes(genre.toLowerCase())) return genre;
  }
  if (joined.includes('hip hop') || joined.includes('hip-hop') || joined.includes('trap')) return 'Hip-Hop';
  if (joined.includes('r&b') || joined.includes('rnb')) return 'R&B';
  if (joined.includes('electro') || joined.includes('house') || joined.includes('techno') || joined.includes('edm')) return 'Electronic';
  if (joined.includes('indie')) return 'Indie';
  if (joined.includes('metal') || joined.includes('heavy')) return 'Metal';
  if (joined.includes('punk')) return 'Punk';
  if (joined.includes('class')) return 'Classical';
  if (joined.includes('rap')) return 'Rap';
  if (joined.includes('k-pop') || joined.includes('kpop')) return 'K-Pop';
  if (joined.includes('afro')) return 'Afrobeats';
  if (joined.includes('rock')) return 'Rock';
  if (joined.includes('pop')) return 'Pop';
  return 'Autre';
}

function isSpotifyLink(value: string): boolean {
  return value.includes('spotify.com/album') || value.includes('spotify:album:');
}

export default function AddAlbumModal({ isOpen, onClose, uid }: AddAlbumModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [preview, setPreview] = useState<SpotifyAlbumData | null>(null);
  const [results, setResults] = useState<SpotifySearchResult[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('Autre');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const resetState = useCallback(() => {
    setInput('');
    setPreview(null);
    setResults([]);
    setSelectedGenre('Autre');
    setLoading(false);
    setSearching(false);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleLinkFetch = async (value: string) => {
    const albumId = extractAlbumId(value);
    if (!albumId) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await fetchAlbumFromSpotify(albumId);
      setPreview(data);
      setSelectedGenre(matchGenre(data.genres));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAlbums(query);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setPreview(null);
    if (isSpotifyLink(value)) {
      handleLinkFetch(value);
    } else {
      handleSearch(value);
    }
  };

  const handleSelectResult = async (result: SpotifySearchResult) => {
    setResults([]);
    setLoading(true);
    try {
      const data = await fetchAlbumFromSpotify(result.spotifyId);
      setPreview(data);
      setInput(result.name);
      setSelectedGenre(matchGenre(data.genres));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await addAlbum(uid, {
        spotifyId: preview.spotifyId,
        name: preview.name,
        artist: preview.artist,
        coverUrl: preview.coverUrl,
        spotifyUrl: preview.spotifyUrl,
        genre: selectedGenre,
        rating: null,
        addedAt: new Date().toISOString(),
      });
      toast.success(`"${preview.name}" ajouté !`);
      resetState();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const linkMode = isSpotifyLink(input);

  return (
    <dialog className="modal modal-open modal-top sm:modal-middle">
      <div className="modal-box bg-base-200 border border-white/5 p-4 sm:p-5">
        <h3 className="font-semibold text-base mb-3 sm:mb-4">Ajouter un album</h3>

        {/* Smart input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">
            {linkMode ? <FaLink className="text-sm" /> : <FaSearch className="text-sm" />}
          </div>
          <input
            type="text"
            placeholder="Rechercher un album..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-base-300 border border-white/5 placeholder:text-base-content/30 focus:outline-none focus:border-spotify/50 transition-colors"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            autoFocus
            disabled={loading}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="loading loading-spinner loading-xs text-spotify"></span>
            </div>
          )}
        </div>

        {/* Search results dropdown */}
        {results.length > 0 && !preview && (
          <div className="mt-2 max-h-60 overflow-y-auto rounded-xl bg-base-300 border border-white/5 divide-y divide-white/5">
            {results.map((r) => (
              <button
                key={r.spotifyId}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                onClick={() => handleSelectResult(r)}
              >
                <img src={r.coverUrl} alt={r.name} className="w-10 h-10 rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-base-content/40 truncate">{r.artist} · {r.releaseDate?.slice(0, 4)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-spotify"></span>
          </div>
        )}

        {/* Preview */}
        {preview && !loading && (
          <div className="mt-4 flex gap-3 items-start">
            <img src={preview.coverUrl} alt={preview.name} className="w-20 h-20 rounded-lg shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{preview.name}</p>
              <p className="text-xs text-base-content/40 truncate">{preview.artist}</p>
              <select
                className="mt-2 w-full px-3 py-1.5 rounded-lg bg-base-300 border border-white/5 text-xs focus:outline-none focus:border-spotify/50"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-5 justify-end">
          <button
            className="px-4 py-2 rounded-lg text-sm text-base-content/50 hover:text-base-content transition-colors"
            onClick={handleClose}
          >
            Annuler
          </button>
          <button
            className="px-5 py-2 rounded-lg text-sm font-medium bg-spotify text-black hover:bg-spotify-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleAdd}
            disabled={!preview || loading}
          >
            Ajouter
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-sm">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
}
