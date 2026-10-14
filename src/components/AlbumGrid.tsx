import type { Album } from '../types';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: Album[];
  favoriteAlbumId?: string | null;
  filtered?: boolean;
  selecting: boolean;
  selectedIds: Set<string>;
  onAdd: () => void;
  onOpen: (album: Album) => void;
  onToggleSelect: (id: string) => void;
  onLongPress: (id: string) => void;
}

export function AlbumGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 pb-8">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton h-3 w-3/4 mt-2" />
          <div className="skeleton h-3 w-1/2 mt-1.5" />
        </div>
      ))}
    </div>
  );
}

export default function AlbumGrid({ albums, favoriteAlbumId, filtered, selecting, selectedIds, onAdd, onOpen, onToggleSelect, onLongPress }: AlbumGridProps) {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-5xl mb-3">🎵</p>
        <p className="text-base font-medium text-base-content/60">{filtered ? 'Aucun résultat' : 'Rien ici pour le moment'}</p>
        <p className="text-sm text-base-content/30 mt-1">
          {filtered ? 'Essaie un autre filtre ou une autre recherche' : 'Colle un lien Spotify ou recherche un album'}
        </p>
        {!filtered && (
          <button className="mt-5 px-6 min-h-12 rounded-full bg-spotify text-black text-sm font-semibold active:scale-95 transition-transform" onClick={onAdd}>
            Ajouter un album
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 pb-8">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          isFavorite={favoriteAlbumId === album.id}
          selecting={selecting}
          selected={selectedIds.has(album.id)}
          onOpen={onOpen}
          onToggleSelect={onToggleSelect}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  );
}
