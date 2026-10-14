import { useRef } from 'react';
import { FaStar, FaHeart, FaCheck } from 'react-icons/fa';
import AlbumCover from './AlbumCover';
import type { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  isFavorite?: boolean;
  selecting?: boolean;
  selected?: boolean;
  onOpen: (album: Album) => void;
  onToggleSelect: (id: string) => void;
  onLongPress: (id: string) => void;
}

const LONG_PRESS_MS = 450;

export default function AlbumCard({ album, isFavorite, selecting, selected, onOpen, onToggleSelect, onLongPress }: AlbumCardProps) {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const fired = useRef(false);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const handleClick = () => {
    if (fired.current) {
      fired.current = false;
      return;
    }
    if (selecting) onToggleSelect(album.id);
    else onOpen(album);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={album.name}
      aria-pressed={selecting ? !!selected : undefined}
      className="group select-none [-webkit-touch-callout:none] cursor-pointer animate-[fadeIn_.3s_ease-out] active:scale-[0.97] transition-transform"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        fired.current = false;
        origin.current = { x: e.clientX, y: e.clientY };
        cancel();
        timer.current = setTimeout(() => {
          fired.current = true;
          navigator.vibrate?.(15);
          onLongPress(album.id);
        }, LONG_PRESS_MS);
      }}
      onPointerMove={(e) => {
        if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > 10) cancel();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
    >
      <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/40 ring-2 transition-all ${selected ? 'ring-spotify scale-95' : 'ring-transparent'}`}>
        <AlbumCover src={album.coverUrl} alt={album.name} />
        {album.rating ? (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[11px] font-medium text-amber-400">
            <FaStar className="text-[9px]" />{album.rating}
          </span>
        ) : null}
        {isFavorite && (
          <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-error">
            <FaHeart className="text-[10px]" />
          </span>
        )}
        {selecting && (
          <span className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${selected ? 'bg-spotify border-spotify text-black' : 'bg-black/50 border-white/60'}`}>
            {selected && <FaCheck className="text-[10px]" />}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-sm font-semibold leading-tight line-clamp-1">{album.name}</h3>
      <p className="text-xs text-base-content/40 line-clamp-1">{album.artist}</p>
    </div>
  );
}
