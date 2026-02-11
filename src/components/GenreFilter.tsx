interface GenreFilterProps {
  genres: string[];
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
  genreCounts: Record<string, number>;
}

export default function GenreFilter({
  genres,
  selectedGenre,
  onSelectGenre,
  genreCounts,
}: GenreFilterProps) {
  return (
    <div className="genre-scroll flex gap-2 px-4 py-3 overflow-x-auto">
      <button
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          selectedGenre === null
            ? 'bg-spotify text-black'
            : 'bg-white/5 text-base-content/60 hover:bg-white/10'
        }`}
        onClick={() => onSelectGenre(null)}
      >
        Tous
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            selectedGenre === genre
              ? 'bg-spotify text-black'
              : 'bg-white/5 text-base-content/60 hover:bg-white/10'
          }`}
          onClick={() => onSelectGenre(genre)}
        >
          {genre}
          <span className="text-[10px] opacity-60">{genreCounts[genre] || 0}</span>
        </button>
      ))}
    </div>
  );
}

