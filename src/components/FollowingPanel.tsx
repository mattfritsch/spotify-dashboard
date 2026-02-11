import { useEffect, useState } from 'react';
import { FaSearch, FaUser, FaArrowLeft, FaTimes, FaUserPlus } from 'react-icons/fa';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { getFollowing, searchUsersByName, followUser, unfollowUser } from '../services/firestore';
import type { FollowEntry } from '../types';

interface FollowingPanelProps {
  uid: string;
  onBack: () => void;
  onViewProfile: (targetUid: string) => void;
}

export default function FollowingPanel({ uid, onBack, onViewProfile }: FollowingPanelProps) {
  const [following, setFollowing] = useState<FollowEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ uid: string; displayName: string; photoURL: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const list = await getFollowing(uid);
      setFollowing(list);
      setLoading(false);
    })();
  }, [uid]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      void Promise.resolve().then(() => setSearchResults([]));
      return;
    }
    const timeout = setTimeout(() => {
      void (async () => {
        setSearching(true);
        const results = await searchUsersByName(searchQuery.trim(), uid);
        setSearchResults(results);
        setSearching(false);
      })();
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, uid]);

  const handleFollow = async (target: { uid: string; displayName: string; photoURL: string }) => {
    const entry: FollowEntry = {
      uid: target.uid,
      displayName: target.displayName,
      photoURL: target.photoURL,
      followedAt: new Date().toISOString(),
    };
    await followUser(uid, entry);
    setFollowing((prev) => [...prev, entry]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUnfollow = async (targetUid: string) => {
    await unfollowUser(uid, targetUid);
    setFollowing((prev) => prev.filter((f) => f.uid !== targetUid));
  };

  const followedUids = new Set(following.map((f) => f.uid));

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-base-content/40 hover:text-base-content transition-colors mb-6">
        <FaArrowLeft className="text-xs" /> Retour au dashboard
      </button>

      <h2 className="text-lg font-bold mb-5">Mes suivis</h2>

      {/* Search users */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/20 text-sm" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="w-full pl-9 pr-9 py-3 rounded-xl bg-base-200 border border-white/5 text-sm placeholder:text-base-content/30 focus:outline-none focus:border-spotify/50 transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
            <FaTimes className="text-xs" />
          </button>
        )}

        {/* Search results dropdown */}
        {(searchResults.length > 0 || searching) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-base-200 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            {searching ? (
              <div className="p-3 text-center"><span className="loading loading-spinner loading-xs text-spotify"></span></div>
            ) : (
              searchResults.map((user) => (
                <div key={user.uid} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-base-300 flex items-center justify-center shrink-0">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <FaUser className="text-xs text-base-content/20" />}
                  </div>
                  <span className="text-sm flex-1 truncate">{user.displayName}</span>
                  {followedUids.has(user.uid) ? (
                    <span className="text-[10px] text-base-content/30 px-2 py-1 rounded-full bg-white/5">Suivi</span>
                  ) : (
                    <button className="text-spotify hover:text-spotify-dark transition-colors" onClick={() => handleFollow(user)}>
                      <FaUserPlus className="text-sm" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Following list */}
      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-md text-spotify"></span></div>
      ) : following.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/30 text-sm">Tu ne suis personne pour l'instant</p>
          <p className="text-base-content/20 text-xs mt-1">Utilise la recherche ci-dessus pour trouver des utilisateurs</p>
        </div>
      ) : (
        <div className="space-y-1">
          {following.map((entry) => (
            <div key={entry.uid} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-base-200 transition-colors cursor-pointer group" onClick={() => onViewProfile(entry.uid)}>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-base-300 flex items-center justify-center shrink-0 ring-1 ring-white/5">
                {entry.photoURL ? <img src={entry.photoURL} alt="" className="w-full h-full object-cover" /> : <FaUser className="text-sm text-base-content/20" />}
              </div>
              <span className="text-sm font-medium flex-1 truncate">{entry.displayName}</span>
              <button
                className="text-xs text-base-content/20 hover:text-error transition-colors opacity-0 group-hover:opacity-100 px-2 py-1"
                onClick={(e) => { e.stopPropagation(); handleUnfollow(entry.uid); }}
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

