import { useEffect, useState, useMemo, useCallback } from 'react';
import { subscribeToAlbums, deleteAlbum, updateAlbumRating } from '../services/firestore';
import { MOCK_ALBUMS } from '../data/mockAlbums';
import type { Album } from '../types';

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY;

export function useAlbums(uid: string | null) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      void Promise.resolve().then(() => {
        setAlbums(MOCK_ALBUMS);
        setLoading(false);
      });
      return;
    }

    if (!uid) {
      void Promise.resolve().then(() => {
        setAlbums([]);
        setLoading(false);
      });
      return;
    }

    void Promise.resolve().then(() => setLoading(true));
    const unsubscribe = subscribeToAlbums(uid, (data) => {
      setAlbums(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const genres = useMemo(() => {
    const set = new Set(albums.map((a) => a.genre));
    return Array.from(set).sort();
  }, [albums]);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    albums.forEach((a) => {
      counts[a.genre] = (counts[a.genre] || 0) + 1;
    });
    return counts;
  }, [albums]);

  const topGenre = useMemo(() => {
    if (genres.length === 0) return null;
    return genres.reduce((top, g) => (genreCounts[g] > (genreCounts[top] || 0) ? g : top), genres[0]);
  }, [genres, genreCounts]);

  const handleDelete = useCallback(async (id: string) => {
    if (USE_MOCK) {
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    if (!uid) return;
    try {
      await deleteAlbum(uid, id);
    } catch {
      // handled by toast in component
    }
  }, [uid]);

  const handleRate = useCallback(async (id: string, rating: number | null) => {
    if (USE_MOCK) {
      setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, rating } : a)));
      return;
    }
    if (!uid) return;
    try {
      await updateAlbumRating(uid, id, rating);
    } catch {
      // handled by toast in component
    }
  }, [uid]);

  return {
    albums,
    loading,
    genres,
    genreCounts,
    topGenre,
    handleDelete,
    handleRate,
  };
}

