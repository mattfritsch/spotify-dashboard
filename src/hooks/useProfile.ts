import { useEffect, useState, useCallback } from 'react';
import { getUserProfile, saveUserProfile } from '../services/firestore';
import type { UserProfile } from '../types';

export function useProfile(uid: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      void Promise.resolve().then(() => {
        setProfile(null);
        setLoading(false);
      });
      return;
    }

    void (async () => {
      setLoading(true);
      const p = await getUserProfile(uid);
      setProfile(p);
      setLoading(false);
    })();
  }, [uid]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!uid) return;
    const updated: UserProfile = {
      displayName: data.displayName ?? profile?.displayName ?? '',
      photoURL: data.photoURL ?? profile?.photoURL ?? '',
      favoriteAlbumId: data.favoriteAlbumId !== undefined ? data.favoriteAlbumId : (profile?.favoriteAlbumId ?? null),
    };
    await saveUserProfile(uid, updated);
    setProfile(updated);
  }, [uid, profile]);

  return { profile, loading, updateProfile };
}

