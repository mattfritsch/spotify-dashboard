import { useState } from 'react';
import GenreSelect from './GenreSelect';

interface Props {
  kind: 'genre' | 'list';
  count: number;
  genres: string[];
  lists: string[];
  onApply: (value: string) => void;
  onClose: () => void;
}

export default function BatchDialog({ kind, count, genres, lists, onApply, onClose }: Props) {
  const [genre, setGenre] = useState(genres[0] ?? 'Autre');
  const [list, setList] = useState(lists[0] ?? '');

  const newList = () => {
    const name = prompt('Nom de la liste (ex : Road trip)')?.trim().slice(0, 30);
    if (name) setList(name);
  };

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle" onCancel={onClose}>
      <div className="modal-box bg-base-200 border border-white/5 p-4 safe-bottom">
        <h3 className="font-semibold mb-3">
          {kind === 'genre' ? 'Changer le genre' : 'Ajouter à une liste'} · {count} album{count > 1 ? 's' : ''}
        </h3>
        {kind === 'genre' ? (
          <GenreSelect className="w-full" value={genre} genres={genres} onChange={setGenre} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...lists, ...(list ? [list] : [])])).map((l) => (
              <button key={l} className={`px-3 min-h-10 rounded-full text-sm ${list === l ? 'bg-spotify text-black font-medium' : 'bg-white/5 text-base-content/60'}`} onClick={() => setList(l)}>
                {l}
              </button>
            ))}
            <button className="px-3 min-h-10 rounded-full text-sm border border-dashed border-white/20 text-base-content/50" onClick={newList}>＋ Nouvelle liste</button>
          </div>
        )}
        <div className="flex gap-2 mt-5 justify-end">
          <button className="px-4 min-h-11 rounded-xl text-sm text-base-content/50" onClick={onClose}>Annuler</button>
          <button
            className="px-6 min-h-11 rounded-xl text-sm font-medium bg-spotify text-black disabled:opacity-30"
            disabled={kind === 'list' && !list}
            onClick={() => onApply(kind === 'genre' ? genre : list)}
          >
            Appliquer
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-sm">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
