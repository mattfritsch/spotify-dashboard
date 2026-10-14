import type { Album } from '../types';

/** Albums both users own + a 0-100 score (50% shared albums, 50% genre taste). */
export function compatibility(mine: Album[], theirs: Album[]) {
  const mineIds = new Set(mine.map((a) => a.spotifyId));
  const common = theirs.filter((a) => mineIds.has(a.spotifyId));
  const union = new Set([...mineIds, ...theirs.map((a) => a.spotifyId)]).size;
  const jaccard = union ? common.length / union : 0;

  const vec = (l: Album[]) => {
    const m: Record<string, number> = {};
    l.forEach((a) => (m[a.genre] = (m[a.genre] || 0) + 1));
    return m;
  };
  const [va, vb] = [vec(mine), vec(theirs)];
  const dot = Object.keys(va).reduce((s, g) => s + va[g] * (vb[g] || 0), 0);
  const norm = (v: Record<string, number>) => Math.sqrt(Object.values(v).reduce((s, n) => s + n * n, 0));
  const cosine = norm(va) && norm(vb) ? dot / (norm(va) * norm(vb)) : 0;

  return { common, score: Math.round((jaccard * 0.5 + cosine * 0.5) * 100) };
}
