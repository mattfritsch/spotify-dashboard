import type { Album } from '../types';

function Bars({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="bg-base-200 rounded-xl p-4 border border-white/5">
      <h3 className="text-xs uppercase tracking-wider text-base-content/40 mb-3">{title}</h3>
      <div className="space-y-2">
        {rows.map(([label, n]) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 truncate text-base-content/60">{label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-spotify" style={{ width: `${(n / max) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-base-content/40">{n}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const count = (keys: string[]) => {
  const m: Record<string, number> = {};
  keys.forEach((k) => (m[k] = (m[k] || 0) + 1));
  return m;
};

export default function StatsView({ albums }: { albums: Album[] }) {
  if (albums.length === 0) {
    return <p className="text-center text-sm text-base-content/40 py-24">Ajoute des albums pour voir tes stats</p>;
  }
  const genres = Object.entries(count(albums.map((a) => a.genre))).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const ratings = count(albums.filter((a) => a.rating).map((a) => String(a.rating)));
  const stars: [string, number][] = [5, 4, 3, 2, 1].map((n) => [`${'★'.repeat(n)}`, ratings[n] || 0]);
  const years = Object.entries(count(albums.map((a) => a.addedAt.slice(0, 4)))).sort((a, b) => b[0].localeCompare(a[0]));
  const dated = albums.filter((a) => a.releaseYear);
  const decades = Object.entries(count(dated.map((a) => `${Math.floor(a.releaseYear! / 10) * 10}s`))).sort((a, b) => b[0].localeCompare(a[0]));
  const rated = albums.filter((a) => a.rating);
  const avg = rated.length ? (rated.reduce((s, a) => s + a.rating!, 0) / rated.length).toFixed(1) : '—';

  return (
    <div className="px-4 space-y-3 pb-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-spotify">{albums.length}</p>
          <p className="text-[11px] text-base-content/40 uppercase tracking-wider">Albums</p>
        </div>
        <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-amber-400">{avg}</p>
          <p className="text-[11px] text-base-content/40 uppercase tracking-wider">Note moyenne</p>
        </div>
      </div>
      <Bars title="Genres" rows={genres} />
      <Bars title="Notes" rows={stars} />
      {decades.length > 0 && <Bars title="Par décennie de sortie" rows={decades} />}
      <Bars title="Ajoutés par année" rows={years} />
    </div>
  );
}
