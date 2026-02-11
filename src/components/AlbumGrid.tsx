import type { Album } from '../types';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: Album[];
  favoriteAlbumId?: string | null;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number | null) => void;
  onToggleFavorite?: (id: string) => void;
}

export default function AlbumGrid({ albums, favoriteAlbumId, onDelete, onRate, onToggleFavorite }: AlbumGridProps) {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-5xl mb-3">🎵</p>
        <p className="text-base font-medium text-base-content/60">Aucun album</p>
        <p className="text-sm text-base-content/30 mt-1">Colle un lien Spotify pour commencer</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-4 pb-8">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          isFavorite={favoriteAlbumId === album.id}
          onDelete={onDelete}
          onRate={onRate}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

