import { useEffect, useState } from 'react';
import { FaUser, FaHeart, FaArrowLeft, FaStar, FaSpotify, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import AlbumCover from './AlbumCover';
import FriendAlbumSheet from './FriendAlbumSheet';
import { compatibility } from '../lib/compat';
import { getUserProfile, getAlbumsOnce } from '../services/firestore';
import type { Album, UserProfile } from '../types';

interface PublicProfileViewProps {
  targetUid: string;
  myAlbums: Album[];
  me: { uid: string; name: string };
  isFollowing: boolean;
  onBack: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
}

export default function PublicProfileView({ targetUid, myAlbums, me, isFollowing, onBack, onFollow, onUnfollow }: PublicProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Album | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [p, a] = await Promise.all([getUserProfile(targetUid), getAlbumsOnce(targetUid)]);
      setProfile(p);
      setAlbums(a.filter((x) => !x.wishlist));
      setLoading(false);
    })();
  }, [targetUid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-md text-spotify"></span>
      </div>
    );
  }

  const { common, score } = compatibility(myAlbums.filter((a) => !a.wishlist), albums);
  const displayName = profile?.displayName || 'Utilisateur';
  const favAlbum = albums.find((a) => a.id === profile?.favoriteAlbumId);
  const genreCounts: Record<string, number> = {};
  let totalRating = 0;
  let ratedCount = 0;
  for (const a of albums) {
    genreCounts[a.genre] = (genreCounts[a.genre] || 0) + 1;
    if (a.rating) { totalRating += a.rating; ratedCount++; }
  }
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-base-content/40 hover:text-base-content transition-colors mb-6 min-h-11">
        <FaArrowLeft className="text-xs" /> Retour
      </button>

      <div className="flex flex-col items-center mb-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 bg-base-300 flex items-center justify-center mb-4">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <FaUser className="text-3xl text-base-content/20" />
          )}
        </div>
        <h2 className="text-xl font-bold mb-1">{displayName}</h2>

        {/* Follow button */}
        <button
          className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors active:scale-95 ${
            isFollowing
              ? 'bg-white/10 text-base-content hover:bg-error/20 hover:text-error'
              : 'bg-spotify text-black hover:bg-spotify-dark'
          }`}
          onClick={isFollowing ? onUnfollow : onFollow}
        >
          {isFollowing ? <><FaUserMinus className="text-xs" /> Ne plus suivre</> : <><FaUserPlus className="text-xs" /> Suivre</>}
        </button>

        {/* Fav album */}
        {favAlbum && (
          <div className="mt-4 flex items-center gap-2 p-2 rounded-lg bg-base-200 border border-white/5">
            <AlbumCover src={favAlbum.coverUrl} alt={favAlbum.name} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-base-content/40 flex items-center gap-1"><FaHeart className="text-error text-[9px]" /> Album préféré</p>
              <p className="text-sm font-medium truncate">{favAlbum.name} — {favAlbum.artist}</p>
            </div>
          </div>
        )}
      </div>

      {/* Compatibility */}
      {myAlbums.some((a) => !a.wishlist) && albums.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-spotify/20 to-secondary/20 border border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Compatibilité musicale</p>
            <p className="text-2xl font-bold text-spotify">{score}%</p>
          </div>
          <p className="text-xs text-base-content/50 mt-1">
            {common.length === 0 ? 'Aucun album en commun… pour l’instant' : `${common.length} album${common.length > 1 ? 's' : ''} en commun`}
          </p>
          {common.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto genre-scroll">
              {common.map((a) => (
                <div key={a.id} className="w-14 h-14 rounded-lg overflow-hidden shrink-0" onClick={() => setSelected(a)}>
                  <AlbumCover src={a.coverUrl} alt={a.name} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-spotify">{albums.length}</p>
          <p className="text-[11px] text-base-content/40 uppercase tracking-wider mt-0.5">Albums</p>
        </div>
        <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
          <p className="text-lg font-bold text-secondary truncate">{topGenre || '—'}</p>
          <p className="text-[11px] text-base-content/40 uppercase tracking-wider mt-0.5">Top genre</p>
        </div>
        <div className="bg-base-200 rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
            {avgRating ? <><FaStar className="text-sm" />{avgRating}</> : '—'}
          </p>
          <p className="text-[11px] text-base-content/40 uppercase tracking-wider mt-0.5">Moy.</p>
        </div>
      </div>

      {/* Album grid (read-only) */}
      {albums.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {albums.map((album) => (
            <div key={album.id} className="rounded-xl overflow-hidden bg-base-200 border border-white/5">
              <div className="aspect-square cursor-pointer" onClick={() => setSelected(album)}>
                <AlbumCover src={album.coverUrl} alt={album.name} />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-1">{album.name}</p>
                <p className="text-[10px] text-base-content/40 line-clamp-1">{album.artist}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-spotify/15 text-spotify">{album.genre}</span>
                  {album.rating && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5"><FaStar className="text-[8px]" />{album.rating}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaSpotify className="text-3xl text-base-content/10 mx-auto mb-2" />
          <p className="text-sm text-base-content/30">Aucun album ajouté</p>
        </div>
      )}

      {selected && <FriendAlbumSheet album={selected} ownerUid={targetUid} me={me} onClose={() => setSelected(null)} />}
    </div>
  );
}

