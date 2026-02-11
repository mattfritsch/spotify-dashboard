import { FaStar, FaTrash, FaSpotify, FaHeart } from 'react-icons/fa';
import AlbumCover from './AlbumCover';
import type { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  isFavorite?: boolean;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number | null) => void;
  onToggleFavorite?: (id: string) => void;
}

export default function AlbumCard({ album, isFavorite, onDelete, onRate, onToggleFavorite }: AlbumCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-base-200 border border-white/5 transition-all duration-200 active:scale-[0.98] hover:border-white/10">
      {/* Cover */}
      <div
        className="relative cursor-pointer aspect-square"
        onClick={() => window.open(album.spotifyUrl, '_blank')}
      >
        <AlbumCover src={album.coverUrl} alt={album.name} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <FaSpotify className="text-spotify text-4xl opacity-0 group-hover:opacity-100 transition-all duration-200 drop-shadow-lg" />
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1">
        <h3 className="text-sm font-semibold leading-tight line-clamp-1">{album.name}</h3>
        <p className="text-xs text-base-content/40 line-clamp-1">{album.artist}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-spotify/15 text-spotify font-medium">
            {album.genre}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="p-1.5 -m-1 touch-manipulation active:scale-125 transition-transform"
                onClick={() => onRate(album.id, album.rating === star ? null : star)}
              >
                <FaStar
                  className={`text-xs transition-colors ${
                    album.rating && star <= album.rating
                      ? 'text-amber-400'
                      : 'text-white/10'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Favorite */}
      {onToggleFavorite && (
        <button
          className={`absolute top-2 left-2 p-1.5 rounded-full transition-all ${
            isFavorite
              ? 'bg-error/80 text-white opacity-100'
              : 'bg-black/60 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-error/60 hover:text-white'
          }`}
          onClick={() => onToggleFavorite(album.id)}
          title={isFavorite ? 'Retirer des favoris' : 'Album préféré'}
        >
          <FaHeart className="text-[10px]" />
        </button>
      )}

      {/* Delete */}
      <button
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/60 opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white"
        onClick={() => onDelete(album.id)}
      >
        <FaTrash className="text-[10px]" />
      </button>
    </div>
  );
}

