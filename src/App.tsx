import { useState, useMemo, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FaSpotify } from 'react-icons/fa';
import Navbar from './components/Navbar';
import AddAlbumModal from './components/AddAlbumModal';
import ProfileModal from './components/ProfileModal';
import AlbumGrid from './components/AlbumGrid';
import GenreFilter from './components/GenreFilter';
import StatsBar from './components/StatsBar';
import FollowingPanel from './components/FollowingPanel';
import PublicProfileView from './components/PublicProfileView';
import { useAlbums } from './hooks/useAlbums';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { getFollowing, followUser, unfollowUser, getUserProfile } from './services/firestore';

type AppView = 'dashboard' | 'following' | 'publicProfile';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('dashboard');
  const [viewingUid, setViewingUid] = useState<string | null>(null);
  const [followingUids, setFollowingUids] = useState<Set<string>>(new Set());

  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { profile, updateProfile } = useProfile(user?.uid ?? null);
  const { albums, loading, genres, genreCounts, topGenre, handleDelete, handleRate } = useAlbums(user?.uid ?? null);

  // Load following list for public profile follow/unfollow state
  const refreshFollowingUids = useCallback(async () => {
    if (!user) return;
    const list = await getFollowing(user.uid);
    setFollowingUids(new Set(list.map((f) => f.uid)));
  }, [user]);

  const filteredAlbums = useMemo(() => {
    if (!selectedGenre) return albums;
    return albums.filter((a) => a.genre === selectedGenre);
  }, [albums, selectedGenre]);

  const handleToggleFavorite = useCallback(async (albumId: string) => {
    const newFav = profile?.favoriteAlbumId === albumId ? null : albumId;
    await updateProfile({ favoriteAlbumId: newFav });
  }, [profile, updateProfile]);

  const navigateToProfile = useCallback(async (targetUid: string) => {
    await refreshFollowingUids();
    setViewingUid(targetUid);
    setView('publicProfile');
  }, [refreshFollowingUids]);

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

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-spotify"></span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center px-6">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e1e1e',
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '14px',
              borderRadius: '12px',
            },
          }}
        />
        <FaSpotify className="text-spotify text-6xl mb-6" />
        <h1 className="text-2xl font-bold mb-2">Spotify Dashboard</h1>
        <p className="text-sm text-base-content/40 mb-8 text-center max-w-xs">
          Connecte-toi pour organiser et noter tes albums préférés
        </p>
        <button
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors active:scale-95 shadow-lg"
          onClick={signIn}
        >
          <FcGoogle className="text-xl" />
          Se connecter avec Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#e4e4e7',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />
      <Navbar
        onAddClick={() => setModalOpen(true)}
        user={user}
        profile={profile}
        onSignIn={signIn}
        onSignOut={signOut}
        onEditProfile={() => setProfileOpen(true)}
        onFollowingClick={() => setView('following')}
      />

      {view === 'dashboard' && (
        <div className="max-w-7xl mx-auto pt-4">
          {albums.length > 0 && (
            <div className="px-4 mb-2">
              <StatsBar totalAlbums={albums.length} totalGenres={genres.length} topGenre={topGenre} />
            </div>
          )}
          {genres.length > 0 && (
            <GenreFilter genres={genres} selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} genreCounts={genreCounts} />
          )}
          {loading && (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-md text-spotify"></span>
            </div>
          )}
          {!loading && (
            <AlbumGrid
              albums={filteredAlbums}
              favoriteAlbumId={profile?.favoriteAlbumId}
              onDelete={handleDelete}
              onRate={handleRate}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>
      )}

      {view === 'following' && (
        <FollowingPanel
          uid={user.uid}
          onBack={() => setView('dashboard')}
          onViewProfile={navigateToProfile}
        />
      )}

      {view === 'publicProfile' && viewingUid && (
        <PublicProfileView
          targetUid={viewingUid}
          isFollowing={followingUids.has(viewingUid)}
          onBack={() => setView('following')}
          onFollow={handleFollowFromProfile}
          onUnfollow={handleUnfollowFromProfile}
        />
      )}

      <AddAlbumModal isOpen={modalOpen} onClose={() => setModalOpen(false)} uid={user.uid} />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        albums={albums}
        onSave={updateProfile}
      />
    </div>
  );
}

export default App;

