import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSpotify, FaShareAlt, FaStar, FaHeart, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import AlbumCover from './AlbumCover';
import GenreSelect from './GenreSelect';
import { fetchAlbumDetails, type TrackInfo } from '../services/spotify';
import type { Album, AlbumFields } from '../types';

interface Props {
  album: Album;
  isFavorite: boolean;
  genres: string[];
  lists: string[];
  onClose: () => void;
  onUpdate: (id: string, fields: AlbumFields) => Promise<void>;
  onRate: (id: string, rating: number | null) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Mounted only while open (keyed by album id): the note is saved on unmount, whatever closed the sheet. */
export default function AlbumDetailModal({ album, isFavorite, genres, lists, onClose, onUpdate, onRate, onToggleFavorite, onDelete }: Props) {
  const [tracks, setTracks] = useState<TrackInfo[] | null>(null);
  const [note, setNote] = useState(album.note || '');
  const [playing, setPlaying] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const skipSave = useRef(false);

  const latest = useRef({ note, album, onUpdate });
  useEffect(() => {
    latest.current = { note, album, onUpdate };
  });

  useEffect(() => {
    let cancelled = false;
    fetchAlbumDetails(album.spotifyId)
      .then((d) => !cancelled && setTracks(d.tracks))
      .catch(() => !cancelled && setTracks([]));
    return () => {
      cancelled = true;
    };
  }, [album.spotifyId]);

  useEffect(() => {
    const a = audio.current;
    return () => {
      a?.pause();
      const { note: n, album: al, onUpdate: update } = latest.current;
      if (!skipSave.current && n !== (al.note || '')) update(al.id, { note: n }).catch(() => toast.error("La note n'a pas pu être enregistrée"));
    };
  }, []);

  const togglePreview = (i: number, url: string) => {
    audio.current?.pause();
    if (playing === i) return setPlaying(null);
    const a = new Audio(url);
    a.onended = () => setPlaying(null);
    a.play().catch(() => toast.error('Lecture impossible'));
    audio.current = a;
    setPlaying(i);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: album.name, text: `${album.name} – ${album.artist}`, url: album.spotifyUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(album.spotifyUrl);
      toast.success('Lien copié');
    }
  };

  const save = (fields: AlbumFields) => onUpdate(album.id, fields).catch(() => toast.error('Erreur de sauvegarde'));
  const albumLists = album.lists ?? [];
  const toggleList = (l: string) => save({ lists: albumLists.includes(l) ? albumLists.filter((x) => x !== l) : [...albumLists, l] });
  const newList = () => {
    const name = prompt('Nom de la liste (ex : Road trip)')?.trim().slice(0, 30);
    if (name && !albumLists.includes(name)) save({ lists: [...albumLists, name] });
  };
  const previewCount = tracks?.filter((t) => t.previewUrl).length ?? 0;

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle" onCancel={onClose}>
      <div className="modal-box bg-base-200 border border-white/5 p-0 safe-bottom relative">
        <div
          className="absolute inset-x-0 top-0 h-72 opacity-40 blur-2xl scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${album.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-transparent to-base-200 pointer-events-none" />

        <div className="relative p-5">
          <div className="w-44 h-44 mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            <AlbumCover src={album.coverUrl} alt={album.name} />
          </div>
          <div className="text-center mt-4">
            <h3 className="text-lg font-bold leading-tight">{album.name}</h3>
            <p className="text-sm text-base-content/60">{album.artist}{album.releaseYear ? ` · ${album.releaseYear}` : ''}</p>
          </div>

          {/* Rating + favorite */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                className="w-11 h-11 flex items-center justify-center active:scale-125 transition-transform"
                onClick={() => { navigator.vibrate?.(8); onRate(album.id, album.rating === star ? null : star); }}
              >
                <FaStar className={`text-2xl transition-colors ${album.rating && star <= album.rating ? 'text-amber-400' : 'text-white/15'}`} />
              </button>
            ))}
            <button
              aria-label={isFavorite ? 'Retirer des favoris' : 'Album préféré'}
              className="w-11 h-11 flex items-center justify-center active:scale-125 transition-transform ml-2"
              onClick={() => onToggleFavorite(album.id)}
            >
              <FaHeart className={`text-xl ${isFavorite ? 'text-error' : 'text-white/15'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <a href={album.spotifyUrl} target="_blank" rel="noreferrer" className="flex-1 min-h-12 rounded-full bg-spotify text-black text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <FaSpotify className="text-lg" /> Écouter sur Spotify
            </a>
            <button aria-label="Partager" className="min-h-12 min-w-12 rounded-full bg-white/10 flex items-center justify-center" onClick={share}>
              <FaShareAlt />
            </button>
          </div>

          {/* Genre + wishlist */}
          <div className="flex gap-2 mt-3">
            <GenreSelect className="flex-1" value={album.genre} genres={genres} onChange={(genre) => save({ genre })} />
            <button className="min-h-11 px-4 rounded-xl bg-white/5 text-xs" onClick={() => { save({ wishlist: !album.wishlist }); onClose(); }}>
              {album.wishlist ? '→ Collection' : '→ À écouter'}
            </button>
          </div>

          {/* Lists */}
          <div className="flex flex-wrap gap-2 mt-3">
            {Array.from(new Set([...lists, ...albumLists])).map((l) => (
              <button key={l} className={`px-3 min-h-9 rounded-full text-xs ${albumLists.includes(l) ? 'bg-spotify text-black font-medium' : 'bg-white/5 text-base-content/60'}`} onClick={() => toggleList(l)}>
                {l}
              </button>
            ))}
            <button className="px-3 min-h-9 rounded-full text-xs border border-dashed border-white/20 text-base-content/50" onClick={newList}>＋ Liste</button>
          </div>

          <textarea
            className="w-full mt-4 p-3 rounded-xl bg-base-300/80 border border-white/5 text-sm focus:outline-none focus:border-spotify/50"
            rows={3}
            placeholder="Mon avis, mes notes…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Tracks */}
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-base-content/40 mb-2">
              Titres{previewCount > 0 && ' · appuie sur ▶ pour un extrait'}
            </p>
            {tracks === null ? (
              <div className="skeleton h-24 w-full" />
            ) : tracks.length === 0 ? (
              <p className="text-xs text-base-content/30">Titres indisponibles</p>
            ) : (
              <ol className="text-sm max-h-52 overflow-y-auto">
                {tracks.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 min-h-9 text-base-content/70">
                    <span className="w-6 text-right text-xs text-base-content/30">{i + 1}</span>
                    <span className="flex-1 truncate">{t.name}</span>
                    {t.previewUrl && (
                      <button aria-label="Extrait" className="w-9 h-9 flex items-center justify-center text-spotify" onClick={() => togglePreview(i, t.previewUrl!)}>
                        {playing === i ? <FaPause /> : <FaPlay />}
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <button
            className="w-full mt-5 min-h-11 text-sm text-error/70 flex items-center justify-center gap-2"
            onClick={() => { if (confirm(`Supprimer « ${album.name} » ?`)) { skipSave.current = true; onDelete(album.id); onClose(); } }}
          >
            <FaTrash className="text-xs" /> Supprimer cet album
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-sm">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
