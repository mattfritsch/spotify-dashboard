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
  limit,
  writeBatch,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Album, AlbumFields, UserProfile, FollowEntry, Comment } from '../types';

// --- Albums ---

function userAlbumsCollection(uid: string) {
  return collection(db, 'users', uid, 'albums');
}

function userAlbumDoc(uid: string, albumId: string) {
  return doc(db, 'users', uid, 'albums', albumId);
}

export function subscribeToAlbums(uid: string, callback: (albums: Album[]) => void, onError?: (e: Error) => void): Unsubscribe {
  const q = query(userAlbumsCollection(uid), orderBy('addedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const albums: Album[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Album[];
    callback(albums);
  }, onError);
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

export async function updateAlbumFields(uid: string, albumId: string, fields: AlbumFields): Promise<void> {
  await updateDoc(userAlbumDoc(uid, albumId), fields);
}

const CHUNK = 400; // Firestore batch limit is 500

export async function batchUpdateAlbums(uid: string, ids: string[], fields: AlbumFields): Promise<void> {
  for (let i = 0; i < ids.length; i += CHUNK) {
    const b = writeBatch(db);
    ids.slice(i, i + CHUNK).forEach((id) => b.update(userAlbumDoc(uid, id), fields));
    await b.commit();
  }
}

export async function batchDeleteAlbums(uid: string, ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i += CHUNK) {
    const b = writeBatch(db);
    ids.slice(i, i + CHUNK).forEach((id) => b.delete(userAlbumDoc(uid, id)));
    await b.commit();
  }
}

export async function batchAddAlbums(uid: string, albums: Omit<Album, 'id'>[]): Promise<void> {
  for (let i = 0; i < albums.length; i += CHUNK) {
    const b = writeBatch(db);
    albums.slice(i, i + CHUNK).forEach((a) => b.set(doc(userAlbumsCollection(uid)), a));
    await b.commit();
  }
}

export async function getRecentAlbums(uid: string, n: number): Promise<Album[]> {
  const q = query(userAlbumsCollection(uid), orderBy('addedAt', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Album[];
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


// --- Reactions on a friend's album (rules must allow signed-in users to write these) ---

function reactionsPath(ownerUid: string, albumId: string) {
  return [db, 'users', ownerUid, 'albums', albumId] as const;
}

export async function getReactions(ownerUid: string, albumId: string, myUid: string): Promise<{ likes: number; liked: boolean; comments: Comment[] }> {
  const [likes, comments] = await Promise.all([
    getDocs(collection(...reactionsPath(ownerUid, albumId), 'likes')),
    getDocs(query(collection(...reactionsPath(ownerUid, albumId), 'comments'), orderBy('at', 'asc'), limit(50))),
  ]);
  return {
    likes: likes.size,
    liked: likes.docs.some((d) => d.id === myUid),
    comments: comments.docs.map((d) => ({ id: d.id, ...d.data() })) as Comment[],
  };
}

export async function setLike(ownerUid: string, albumId: string, myUid: string, liked: boolean): Promise<void> {
  const ref = doc(...reactionsPath(ownerUid, albumId), 'likes', myUid);
  if (liked) await setDoc(ref, { at: serverTimestamp() });
  else await deleteDoc(ref);
}

export async function addComment(ownerUid: string, albumId: string, c: Omit<Comment, 'id'>): Promise<string> {
  const ref = await addDoc(collection(...reactionsPath(ownerUid, albumId), 'comments'), c);
  return ref.id;
}
