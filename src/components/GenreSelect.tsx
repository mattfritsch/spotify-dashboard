import { GENRES } from '../types';

interface GenreSelectProps {
  value: string;
  genres: string[]; // genres already used in the collection
  onChange: (genre: string) => void;
  className?: string;
}

export default function GenreSelect({ value, genres, onChange, className = '' }: GenreSelectProps) {
  const options = Array.from(new Set<string>([...GENRES, ...genres, value])).sort((a, b) => a.localeCompare(b));

  const handle = (v: string) => {
    if (v !== '__new') return onChange(v);
    const name = prompt('Nom du nouveau genre')?.trim().slice(0, 30);
    if (name) onChange(name);
  };

  return (
    <select
      aria-label="Genre"
      className={`px-3 min-h-11 rounded-xl bg-base-300 border border-white/5 text-sm focus:outline-none focus:border-spotify/50 ${className}`}
      value={value}
      onChange={(e) => handle(e.target.value)}
    >
      {options.map((g) => (
        <option key={g} value={g}>{g}</option>
      ))}
      <option value="__new">＋ Nouveau genre…</option>
    </select>
  );
}
