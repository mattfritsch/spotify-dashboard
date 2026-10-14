import { useEffect, useState, useMemo, useCallback } from 'react';
import { subscribeToAlbums, deleteAlbum, updateAlbumRating, updateAlbumFields, batchUpdateAlbums, batchDeleteAlbums, batchAddAlbums } from '../services/firestore';
import { MOCK_ALBUMS } from '../data/mockAlbums';
import type { Album, AlbumFields } from '../types';

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY;

export function useAlbums(uid: string | null) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      setError(false);
      setLoading(false);
    }, () => {
      setError(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const collection = useMemo(() => albums.filter((a) => !a.wishlist), [albums]);

  const genres = useMemo(() => {
    const set = new Set(collection.map((a) => a.genre));
    return Array.from(set).sort();
  }, [collection]);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    collection.forEach((a) => {
      counts[a.genre] = (counts[a.genre] || 0) + 1;
    });
    return counts;
  }, [collection]);

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

  const handleUpdate = useCallback(async (id: string, fields: AlbumFields) => {
    if (USE_MOCK) {
      setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)));
      return;
    }
    if (!uid) return;
    await updateAlbumFields(uid, id, fields);
  }, [uid]);

  const handleBatchUpdate = useCallback(async (ids: string[], fields: AlbumFields) => {
    if (USE_MOCK) {
      setAlbums((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, ...fields } : a)));
      return;
    }
    if (uid) await batchUpdateAlbums(uid, ids, fields);
  }, [uid]);

  const handleBatchDelete = useCallback(async (ids: string[]) => {
    if (USE_MOCK) {
      setAlbums((prev) => prev.filter((a) => !ids.includes(a.id)));
      return;
    }
    if (uid) await batchDeleteAlbums(uid, ids);
  }, [uid]);

  /** Adds albums not already present (same spotifyId + same list). Returns how many were added. */
  const handleImport = useCallback(async (incoming: Omit<Album, 'id'>[]) => {
    const key = (a: { spotifyId: string; wishlist?: boolean }) => `${a.spotifyId}:${!!a.wishlist}`;
    const have = new Set(albums.map(key));
    const fresh = incoming.filter((a) => !have.has(key(a)));
    if (USE_MOCK) {
      setAlbums((prev) => [...fresh.map((a, i) => ({ ...a, id: `imp-${Date.now()}-${i}` })), ...prev]);
    } else if (uid && fresh.length) {
      await batchAddAlbums(uid, fresh);
    }
    return fresh.length;
  }, [albums, uid]);

  const lists = useMemo(() => Array.from(new Set(albums.flatMap((a) => a.lists ?? []))).sort(), [albums]);

  return {
    albums,
    lists,
    handleBatchUpdate,
    handleBatchDelete,
    handleImport,
    collection,
    error,
    handleUpdate,
    loading,
    genres,
    genreCounts,
    topGenre,
    handleDelete,
    handleRate,
  };
}

