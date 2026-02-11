interface StatsBarProps {
  totalAlbums: number;
  totalGenres: number;
  topGenre: string | null;
}

export default function StatsBar({ totalAlbums, totalGenres, topGenre }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
        <p className="text-2xl font-bold text-spotify">{totalAlbums}</p>
        <p className="text-[11px] text-base-content/40 uppercase tracking-wider mt-0.5">Albums</p>
      </div>
      <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
        <p className="text-2xl font-bold text-secondary">{totalGenres}</p>
        <p className="text-[11px] text-base-content/40 uppercase tracking-wider mt-0.5">Genres</p>
      </div>
      <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
        <p className="text-lg font-bold text-accent truncate">{topGenre || '—'}</p>
        <p className="text-[11px] text-base-content/40 uppercase tracking-wider mt-0.5">Top</p>
      </div>
    </div>
  );
}

