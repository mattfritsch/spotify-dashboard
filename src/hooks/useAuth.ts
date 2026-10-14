import { useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Don't leave this user's data in the offline cache (shared devices)
      await terminate(db);
      await clearIndexedDbPersistence(db);
      location.reload();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return { user, loading, signIn, signOut };
}

