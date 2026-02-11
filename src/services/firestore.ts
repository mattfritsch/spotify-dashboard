import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  getDocs,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Album, UserProfile, FollowEntry } from '../types';

// --- Albums ---

function userAlbumsCollection(uid: string) {
  return collection(db, 'users', uid, 'albums');
}

function userAlbumDoc(uid: string, albumId: string) {
  return doc(db, 'users', uid, 'albums', albumId);
}

export function subscribeToAlbums(uid: string, callback: (albums: Album[]) => void): Unsubscribe {
  const q = query(userAlbumsCollection(uid), orderBy('addedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const albums: Album[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Album[];
    callback(albums);
  });
}

export async function getAlbumsOnce(uid: string): Promise<Album[]> {
  const q = query(userAlbumsCollection(uid), orderBy('addedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Album[];
}

export async function addAlbum(uid: string, album: Omit<Album, 'id'>): Promise<string> {
  const docRef = await addDoc(userAlbumsCollection(uid), album);
  return docRef.id;
}

export async function deleteAlbum(uid: string, albumId: string): Promise<void> {
  await deleteDoc(userAlbumDoc(uid, albumId));
}

export async function updateAlbumRating(uid: string, albumId: string, rating: number | null): Promise<void> {
  await updateDoc(userAlbumDoc(uid, albumId), { rating });
}

export async function updateAlbumGenre(uid: string, albumId: string, genre: string): Promise<void> {
  await updateDoc(userAlbumDoc(uid, albumId), { genre });
}

// --- User Profile ---

function userProfileDoc(uid: string) {
  return doc(db, 'users', uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userProfileDoc(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function saveUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  await setDoc(userProfileDoc(uid), profile, { merge: true });
}

export async function searchUsersByName(queryStr: string, currentUid: string): Promise<Array<{ uid: string; displayName: string; photoURL: string }>> {
  const q = query(collection(db, 'users'), where('displayName', '>=', queryStr), where('displayName', '<=', queryStr + '\uf8ff'));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.id !== currentUid)
    .map((d) => ({ uid: d.id, displayName: d.data().displayName || '', photoURL: d.data().photoURL || '' }));
}

// --- Following ---

function followingCollection(uid: string) {
  return collection(db, 'users', uid, 'following');
}

export async function getFollowing(uid: string): Promise<FollowEntry[]> {
  const snap = await getDocs(followingCollection(uid));
  return snap.docs.map((d) => d.data() as FollowEntry);
}

export async function followUser(uid: string, target: FollowEntry): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'following', target.uid), target);
}

export async function unfollowUser(uid: string, targetUid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'following', targetUid));
}

