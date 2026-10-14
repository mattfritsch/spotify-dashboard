import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FaSpotify, FaSearch, FaRandom, FaRegCheckSquare } from 'react-icons/fa';
import Navbar from './components/Navbar';
import AddAlbumModal from './components/AddAlbumModal';
import ProfileModal from './components/ProfileModal';
import AlbumGrid, { AlbumGridSkeleton } from './components/AlbumGrid';
import BottomNav, { type Tab } from './components/BottomNav';
import StatsView from './components/StatsView';
import AlbumDetailModal from './components/AlbumDetailModal';
import SelectionBar from './components/SelectionBar';
import BatchDialog from './components/BatchDialog';
import GenreFilter from './components/GenreFilter';
import FollowingPanel from './components/FollowingPanel';
import PublicProfileView from './components/PublicProfileView';
import { useAlbums } from './hooks/useAlbums';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { fetchAlbumDetails } from './services/spotify';
import type { Album } from './types';
import { getFollowing, followUser, unfollowUser, getUserProfile } from './services/firestore';

type AppView = 'dashboard' | 'stats' | 'following' | 'publicProfile';
type Sort = 'recent' | 'rating' | 'artist' | 'name' | 'year';

const STALE_DAYS = 14;
const DAY_MS = 86_400_000;

const toasterOptions = {
  style: {
    background: '#1e1e1e',
    color: '#e4e4e7',
    border: '1px solid rgba(255,255,255,0.05)',
    fontSize: '14px',
    borderRadius: '12px',
  },
};

// Spotify link shared to the PWA (Share Target) → prefill the add modal
function sharedSpotifyLink(): string | null {
  const p = new URLSearchParams(location.search);
  const m = `${p.get('url') ?? ''} ${p.get('text') ?? ''}`.match(/https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]+/);
  return m ? m[0] : null;
}

// History entries carry { view, uid, idx, modal? } so the back gesture closes sheets, then walks views.
const histIdx = (): number => history.state?.idx ?? 0;

function Main() {
  const [sharedLink, setSharedLink] = useState(sharedSpotifyLink);
  const [modalOpen, setModalOpen] = useState(!!sharedLink);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(null);
  const [batchKind, setBatchKind] = useState<'genre' | 'list' | null>(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [view, setView] = useState<AppView>('dashboard');
  const [viewingUid, setViewingUid] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const [followingUids, setFollowingUids] = useState<Set<string>>(new Set());

  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { profile, updateProfile } = useProfile(user?.uid ?? null);
  const {
    albums, collection, lists, error, loading, genres, genreCounts,
    handleDelete, handleRate, handleUpdate, handleBatchUpdate, handleBatchDelete, handleImport,
  } = useAlbums(user?.uid ?? null);

  // --- History: view + sheets -------------------------------------------------

  const closeSheets = useCallback(() => {
    setModalOpen(false);
    setProfileOpen(false);
    setOpenAlbumId(null);
    setBatchKind(null);
    setSharedLink(null);
  }, []);

  useEffect(() => {
    history.replaceState({ view: 'dashboard', uid: null, idx: 0 }, '', location.pathname);
    const onPop = (e: PopStateEvent) => {
      closeSheets();
      setView(e.state?.view ?? 'dashboard');
      setViewingUid(e.state?.uid ?? null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [closeSheets]);

  const go = useCallback((v: AppView, uid: string | null = null) => {
    const cur = history.state;
    if (cur && !cur.modal && cur.view === v && (cur.uid ?? null) === uid) return;
    history.pushState({ view: v, uid, idx: histIdx() + 1 }, '');
    setView(v);
    setViewingUid(uid);
  }, []);

  /** Back one screen; if there is nothing to go back to inside the app, replace instead of exiting the PWA. */
  const goBack = useCallback((fallback: AppView) => {
    if (histIdx() > 0) return history.back();
    history.replaceState({ view: fallback, uid: null, idx: 0 }, '');
    setView(fallback);
    setViewingUid(null);
  }, []);

  /** Opens a sheet as a history entry so the system back gesture closes it. */
  const present = useCallback((open: () => void) => {
    history.pushState({ ...history.state, modal: true, idx: histIdx() + 1 }, '');
    open();
  }, []);

  const dismiss = useCallback(() => {
    if (history.state?.modal) history.back();
    else closeSheets();
  }, [closeSheets]);

  // --- Derived data -----------------------------------------------------------

  const allGenres = useMemo(() => Array.from(new Set(albums.map((a) => a.genre))).sort(), [albums]);
  const activeGenre = selectedGenre && genres.includes(selectedGenre) ? selectedGenre : null;
  const activeList = selectedList && lists.includes(selectedList) ? selectedList : null;
  const openAlbum = openAlbumId ? albums.find((a) => a.id === openAlbumId) : undefined;

  const filteredAlbums = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = albums.filter(
      (a) =>
        !!a.wishlist === showWishlist &&
        (showWishlist || !activeGenre || a.genre === activeGenre) &&
        (!activeList || a.lists?.includes(activeList)) &&
        (!q || `${a.name} ${a.artist}`.toLowerCase().includes(q)),
    );
    // "recent": newest first in the collection, but longest-waiting first in "à écouter"
    const cmp: Record<Sort, (a: Album, b: Album) => number> = {
      recent: (a, b) => (showWishlist ? a.addedAt.localeCompare(b.addedAt) : b.addedAt.localeCompare(a.addedAt)),
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      artist: (a, b) => a.artist.localeCompare(b.artist),
      name: (a, b) => a.name.localeCompare(b.name),
      year: (a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0),
    };
    return list.sort(cmp[sort]);
  }, [albums, activeGenre, activeList, search, sort, showWishlist]);

  const avgRating = useMemo(() => {
    const rated = collection.filter((a) => a.rating);
    return rated.length ? (rated.reduce((s, a) => s + a.rating!, 0) / rated.length).toFixed(1) : null;
  }, [collection]);

  // Oldest "à écouter" album that has been waiting for a while
  const staleAlbum = useMemo(() => {
    const limit = now - STALE_DAYS * DAY_MS;
    return albums
      .filter((a) => a.wishlist && new Date(a.addedAt).getTime() < limit)
      .sort((a, b) => a.addedAt.localeCompare(b.addedAt))[0];
  }, [albums, now]);

  // Fill in missing release years in the background (older albums), a few per load
  const backfilled = useRef(new Set<string>());
  useEffect(() => {
    const todo = albums.filter((a) => !a.releaseYear && !backfilled.current.has(a.id)).slice(0, 25);
    if (!todo.length) return;
    let cancelled = false;
    void (async () => {
      for (const a of todo) {
        if (cancelled) return;
        backfilled.current.add(a.id);
        try {
          const d = await fetchAlbumDetails(a.spotifyId);
          if (d.releaseYear) await handleUpdate(a.id, { releaseYear: d.releaseYear });
        } catch {
          // offline or Spotify unavailable: stays empty
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [albums, handleUpdate]);

  // --- Actions ----------------------------------------------------------------

  const refreshFollowingUids = useCallback(async () => {
    if (!user) return;
    const list = await getFollowing(user.uid);
    setFollowingUids(new Set(list.map((f) => f.uid)));
  }, [user]);

  const handleToggleFavorite = useCallback(async (albumId: string) => {
    const newFav = profile?.favoriteAlbumId === albumId ? null : albumId;
    await updateProfile({ favoriteAlbumId: newFav });
  }, [profile, updateProfile]);

  const navigateToProfile = useCallback(async (targetUid: string) => {
    await refreshFollowingUids();
    go('publicProfile', targetUid);
  }, [refreshFollowingUids, go]);

  const handleFollowFromProfile = useCallback(async () => {
    if (!viewingUid || !user) return;
    const targetProfile = await getUserProfile(viewingUid);
    await followUser(user.uid, {
      uid: viewingUid,
      displayName: targetProfile?.displayName || 'Utilisateur',
      photoURL: targetProfile?.photoURL || '',
      followedAt: new Date().toISOString(),
    });
    await refreshFollowingUids();
  }, [viewingUid, user, refreshFollowingUids]);

  const handleUnfollowFromProfile = useCallback(async () => {
    if (!viewingUid || !user) return;
    await unfollowUser(user.uid, viewingUid);
    await refreshFollowingUids();
  }, [viewingUid, user, refreshFollowingUids]);

  const openDetail = useCallback((a: Album) => present(() => setOpenAlbumId(a.id)), [present]);
  const openAdd = useCallback(() => present(() => setModalOpen(true)), [present]);
  const openProfile = useCallback(() => present(() => setProfileOpen(true)), [present]);

  const surprise = () => {
    if (!filteredAlbums.length) return toast('Rien à tirer au sort ici');
    navigator.vibrate?.(20);
    openDetail(filteredAlbums[Math.floor(Math.random() * filteredAlbums.length)]);
  };

  // Selection mode
  const exitSelection = () => {
    setSelecting(false);
    setSelectedIds(new Set());
  };
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const startSelection = (id?: string) => {
    setSelecting(true);
    if (id) setSelectedIds(new Set([id]));
  };

  const run = async (job: Promise<unknown>, okMsg: string) => {
    try {
      await job;
      toast.success(okMsg);
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const ids = Array.from(selectedIds);
  const batchDelete = async () => {
    if (!confirm(`Supprimer ${ids.length} album${ids.length > 1 ? 's' : ''} ?`)) return;
    await run(handleBatchDelete(ids), 'Supprimé');
    exitSelection();
  };
  const batchMove = async () => {
    await run(handleBatchUpdate(ids, { wishlist: !showWishlist }), showWishlist ? 'Ajouté à la collection' : 'Déplacé vers « à écouter »');
    exitSelection();
  };
  const batchApply = async (value: string) => {
    const kind = batchKind;
    dismiss();
    if (kind === 'genre') {
      await run(handleBatchUpdate(ids, { genre: value }), 'Genre modifié');
    } else {
      await run(
        Promise.all(albums.filter((a) => selectedIds.has(a.id)).map((a) => handleUpdate(a.id, { lists: Array.from(new Set([...(a.lists ?? []), value])) }))),
        `Ajouté à « ${value} »`,
      );
    }
    exitSelection();
  };

  const renameGenre = (from: string, to: string) => {
    const target = collection.filter((a) => a.genre === from).map((a) => a.id);
    void run(handleBatchUpdate(target, { genre: to }), 'Genre renommé');
    setSelectedGenre(to);
  };

  const onTab = (tab: Tab) => {
    exitSelection();
    go(tab);
  };
  const activeTab = view === 'publicProfile' ? 'following' : view;

  // --- Render -----------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-spotify"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh safe-top safe-bottom bg-gradient-to-b from-spotify/15 via-base-100 to-base-100 flex flex-col items-center justify-center px-6">
        <FaSpotify className="text-spotify text-7xl mb-6 drop-shadow-[0_0_30px_rgba(29,185,84,0.5)]" />
        <h1 className="text-3xl font-bold mb-2">Mes albums</h1>
        <p className="text-sm text-base-content/50 mb-10 text-center max-w-xs">
          Garde tous tes albums préférés au même endroit, note-les et partage-les avec tes amis.
        </p>
        <button
          className="flex items-center gap-3 px-7 min-h-12 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors active:scale-95 shadow-lg"
          onClick={signIn}
        >
          <FcGoogle className="text-xl" />
          Se connecter avec Google
        </button>
      </div>
    );
  }

  const isFiltered = !!search || !!activeGenre || !!activeList;
  const staleWeeks = staleAlbum ? Math.floor((now - new Date(staleAlbum.addedAt).getTime()) / (7 * DAY_MS)) : 0;
  const me = { uid: user.uid, name: profile?.displayName || user.displayName || 'Moi' };

  return (
    <div className="min-h-dvh bg-base-100 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <Navbar
        onAddClick={openAdd}
        user={user}
        profile={profile}
        onSignIn={signIn}
        onSignOut={signOut}
        onEditProfile={openProfile}
        onFollowingClick={() => go('following')}
      />

      {view === 'dashboard' && (
        <div className="max-w-7xl mx-auto pt-4">
          <div className="flex items-end justify-between px-4">
            <div>
              <h1 className="text-2xl font-bold">{showWishlist ? 'À écouter' : 'Ma collection'}</h1>
              <p className="text-xs text-base-content/40 mt-0.5">
                {showWishlist ? albums.length - collection.length : collection.length} album{(showWishlist ? albums.length - collection.length : collection.length) > 1 ? 's' : ''}
                {!showWishlist && avgRating && ` · ★ ${avgRating}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button aria-label="Surprends-moi" title="Surprends-moi" className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform" onClick={surprise}>
                <FaRandom />
              </button>
              <button aria-label="Sélectionner" title="Sélectionner" className={`w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform ${selecting ? 'bg-spotify text-black' : 'bg-white/5'}`} onClick={() => (selecting ? exitSelection() : startSelection())}>
                <FaRegCheckSquare />
              </button>
            </div>
          </div>

          {!showWishlist && staleAlbum && !nudgeDismissed && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-spotify/20 to-secondary/20 border border-white/5 flex items-center gap-3">
              <p className="flex-1 text-sm">
                💤 <span className="font-medium">{staleAlbum.name}</span> attend dans ta liste depuis {staleWeeks} semaine{staleWeeks > 1 ? 's' : ''}.
              </p>
              <button className="px-3 min-h-10 rounded-full bg-spotify text-black text-xs font-semibold" onClick={() => openDetail(staleAlbum)}>Écouter</button>
              <button aria-label="Ignorer" className="w-10 h-10 text-base-content/40" onClick={() => setNudgeDismissed(true)}>✕</button>
            </div>
          )}

          <div className="flex p-1 mx-4 mt-3 rounded-full bg-white/5">
            {([false, true] as const).map((w) => (
              <button
                key={String(w)}
                className={`flex-1 min-h-10 rounded-full text-sm font-medium transition-colors ${showWishlist === w ? 'bg-white text-black' : 'text-base-content/60'}`}
                onClick={() => { exitSelection(); setShowWishlist(w); }}
              >
                {w ? 'À écouter' : 'Collection'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 px-4 pt-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-xs" />
              <input
                type="search"
                placeholder="Rechercher un album, un artiste…"
                className="w-full pl-9 pr-3 min-h-11 rounded-xl bg-base-200 border border-white/5 focus:outline-none focus:border-spotify/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Trier"
              className="min-h-11 px-3 rounded-xl bg-base-200 border border-white/5 text-xs"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="recent">{showWishlist ? 'Attente' : 'Récents'}</option>
              <option value="rating">Note</option>
              <option value="artist">Artiste</option>
              <option value="name">Titre</option>
              <option value="year">Sortie</option>
            </select>
          </div>

          {!showWishlist && genres.length > 0 && (
            <GenreFilter genres={genres} selectedGenre={activeGenre} onSelectGenre={setSelectedGenre} genreCounts={genreCounts} onRename={renameGenre} />
          )}
          {lists.length > 0 && (
            <div className="genre-scroll flex gap-2 px-4 pb-2 overflow-x-auto">
              {lists.map((l) => (
                <button
                  key={l}
                  className={`shrink-0 px-3.5 min-h-9 rounded-full text-xs border ${activeList === l ? 'bg-secondary text-white border-secondary' : 'border-white/10 text-base-content/60'}`}
                  onClick={() => setSelectedList(activeList === l ? null : l)}
                >
                  # {l}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            {error ? (
              <div className="text-center py-20 text-sm text-error/80">Impossible de charger tes albums. Vérifie ta connexion.</div>
            ) : loading ? (
              <AlbumGridSkeleton />
            ) : (
              <AlbumGrid
                albums={filteredAlbums}
                favoriteAlbumId={profile?.favoriteAlbumId}
                filtered={isFiltered || (showWishlist ? false : collection.length > 0)}
                selecting={selecting}
                selectedIds={selectedIds}
                onAdd={openAdd}
                onOpen={openDetail}
                onToggleSelect={toggleSelect}
                onLongPress={startSelection}
              />
            )}
          </div>
        </div>
      )}

      {view === 'stats' && (
        <div className="max-w-2xl mx-auto pt-4">
          <h1 className="text-2xl font-bold px-4 mb-4">Mes stats</h1>
          <StatsView albums={collection} />
        </div>
      )}

      {view === 'following' && (
        <FollowingPanel uid={user.uid} onBack={() => goBack('dashboard')} onViewProfile={navigateToProfile} />
      )}

      {view === 'publicProfile' && viewingUid && (
        <PublicProfileView
          targetUid={viewingUid}
          myAlbums={albums}
          me={me}
          isFollowing={followingUids.has(viewingUid)}
          onBack={() => goBack('following')}
          onFollow={handleFollowFromProfile}
          onUnfollow={handleUnfollowFromProfile}
        />
      )}

      <AddAlbumModal
        isOpen={modalOpen}
        onClose={dismiss}
        uid={user.uid}
        genres={allGenres}
        initialValue={sharedLink ?? undefined}
        defaultWishlist={showWishlist}
      />

      {openAlbum && (
        <AlbumDetailModal
          key={openAlbum.id}
          album={openAlbum}
          isFavorite={profile?.favoriteAlbumId === openAlbum.id}
          genres={allGenres}
          lists={lists}
          onClose={dismiss}
          onUpdate={handleUpdate}
          onRate={handleRate}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      )}

      {batchKind && (
        <BatchDialog kind={batchKind} count={selectedIds.size} genres={allGenres} lists={lists} onApply={batchApply} onClose={dismiss} />
      )}

      <ProfileModal
        isOpen={profileOpen}
        onClose={dismiss}
        profile={profile}
        albums={albums}
        onSave={updateProfile}
        onSignOut={signOut}
        onImport={handleImport}
      />

      {selecting ? (
        <SelectionBar
          count={selectedIds.size}
          wishlistTab={showWishlist}
          onCancel={exitSelection}
          onDelete={batchDelete}
          onGenre={() => present(() => setBatchKind('genre'))}
          onList={() => present(() => setBatchKind('list'))}
          onMove={batchMove}
        />
      ) : (
        <BottomNav active={activeTab} onTab={onTab} onAdd={openAdd} onProfile={openProfile} />
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={toasterOptions} />
      <Main />
    </>
  );
}

export default App;
