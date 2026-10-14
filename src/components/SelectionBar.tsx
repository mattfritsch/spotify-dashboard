import { FaTrash, FaTimes, FaTag, FaBookmark, FaListUl } from 'react-icons/fa';

interface SelectionBarProps {
  count: number;
  wishlistTab: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onGenre: () => void;
  onList: () => void;
  onMove: () => void;
}

export default function SelectionBar({ count, wishlistTab, onCancel, onDelete, onGenre, onList, onMove }: SelectionBarProps) {
  const btn = 'flex-1 min-h-14 flex flex-col items-center justify-center gap-0.5 text-[10px] active:bg-white/10 disabled:opacity-30';
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-base-300/95 backdrop-blur-lg border-t border-white/10 safe-bottom animate-[slideUp_.2s_ease-out]">
      <p className="text-center text-xs text-base-content/50 pt-2">{count} sélectionné{count > 1 ? 's' : ''}</p>
      <div className="flex">
        <button className={btn} onClick={onCancel} aria-label="Annuler"><FaTimes className="text-base" />Annuler</button>
        <button className={btn} disabled={!count} onClick={onGenre}><FaTag className="text-base" />Genre</button>
        <button className={btn} disabled={!count} onClick={onList}><FaListUl className="text-base" />Liste</button>
        <button className={btn} disabled={!count} onClick={onMove}><FaBookmark className="text-base" />{wishlistTab ? 'Collection' : 'À écouter'}</button>
        <button className={`${btn} text-error`} disabled={!count} onClick={onDelete}><FaTrash className="text-base" />Supprimer</button>
      </div>
    </div>
  );
}
