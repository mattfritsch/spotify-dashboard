import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAjuEkHMCuLLjp0A2XofrQE7MGRQ92hTWU',
  authDomain: 'spotify-dashboard-c7752.firebaseapp.com',
  projectId: 'spotify-dashboard-c7752',
  storageBucket: 'spotify-dashboard-c7752.firebasestorage.app',
  messagingSenderId: '642969859773',
  appId: '1:642969859773:web:00a6032567c3b50b4029d4',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const albums = [
  {
    spotifyId: '4yP0hdKOZPNshxUOjY0cZj',
    name: 'After Hours',
    artist: 'The Weeknd',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    spotifyUrl: 'https://open.spotify.com/album/4yP0hdKOZPNshxUOjY0cZj',
    genre: 'Pop',
    rating: 5,
    addedAt: '2026-02-11T10:00:00.000Z',
  },
  {
    spotifyId: '2noRn2Aes5aoNVsU6iWThc',
    name: 'Discovery',
    artist: 'Daft Punk',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2734e8b1ccb6b3f9e8e4a9b2a1c',
    spotifyUrl: 'https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc',
    genre: 'Electronic',
    rating: 5,
    addedAt: '2026-02-11T09:00:00.000Z',
  },
  {
    spotifyId: '748dZDqSZy6aPXKcI9H80u',
    name: 'good kid, m.A.A.d city',
    artist: 'Kendrick Lamar',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273d28d2ebdedb220e479743797',
    spotifyUrl: 'https://open.spotify.com/album/748dZDqSZy6aPXKcI9H80u',
    genre: 'Hip-Hop',
    rating: 5,
    addedAt: '2026-02-11T08:00:00.000Z',
  },
  {
    spotifyId: '4m2880jivSbbyEGAKfITCa',
    name: 'Random Access Memories',
    artist: 'Daft Punk',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2739b9b9b9b9b9b9b9b9b9b9b9b',
    spotifyUrl: 'https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa',
    genre: 'Electronic',
    rating: 5,
    addedAt: '2026-02-11T07:00:00.000Z',
  },
  {
    spotifyId: '3mH6qwIy9crq0I9YQbOuDf',
    name: 'Blonde',
    artist: 'Frank Ocean',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
    spotifyUrl: 'https://open.spotify.com/album/3mH6qwIy9crq0I9YQbOuDf',
    genre: 'R&B',
    rating: 4,
    addedAt: '2026-02-11T06:00:00.000Z',
  },
  {
    spotifyId: '2xkZV2Hl1Omi1fNXdoPQCo',
    name: 'Is This It',
    artist: 'The Strokes',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b27313f2466b83507515291acce4',
    spotifyUrl: 'https://open.spotify.com/album/2xkZV2Hl1Omi1fNXdoPQCo',
    genre: 'Rock',
    rating: 4,
    addedAt: '2026-02-11T05:00:00.000Z',
  },
  {
    spotifyId: '4LH4d3cOWNNsVw41Gqt2kv',
    name: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
    spotifyUrl: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv',
    genre: 'Rock',
    rating: 5,
    addedAt: '2026-02-11T04:00:00.000Z',
  },
  {
    spotifyId: '1weenld61qoidwYuZ1GESA',
    name: 'Kind of Blue',
    artist: 'Miles Davis',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2734b4b4b4b4b4b4b4b4b4b4b4b',
    spotifyUrl: 'https://open.spotify.com/album/1weenld61qoidwYuZ1GESA',
    genre: 'Jazz',
    rating: 5,
    addedAt: '2026-02-11T03:00:00.000Z',
  },
  {
    spotifyId: '20r762YmB5HeofjMCiPMLv',
    name: 'My Beautiful Dark Twisted Fantasy',
    artist: 'Kanye West',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2736d4e3b3e3e3e3e3e3e3e3e3e',
    spotifyUrl: 'https://open.spotify.com/album/20r762YmB5HeofjMCiPMLv',
    genre: 'Hip-Hop',
    rating: 5,
    addedAt: '2026-02-11T02:00:00.000Z',
  },
  {
    spotifyId: '1klALx0u4AavZNEvC4LrTL',
    name: 'The Queen Is Dead',
    artist: 'The Smiths',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b1c4a0c36e6e6e6e6e6e6e6e',
    spotifyUrl: 'https://open.spotify.com/album/1klALx0u4AavZNEvC4LrTL',
    genre: 'Indie',
    rating: 4,
    addedAt: '2026-02-11T01:00:00.000Z',
  },
  {
    spotifyId: '7ycBtnsMtyVbbwTfJwRjSP',
    name: 'Currents',
    artist: 'Tame Impala',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
    spotifyUrl: 'https://open.spotify.com/album/7ycBtnsMtyVbbwTfJwRjSP',
    genre: 'Alternative',
    rating: 4,
    addedAt: '2026-02-10T23:00:00.000Z',
  },
  {
    spotifyId: '2guirTSEqLizK7j9i1MTTZ',
    name: 'Nevermind',
    artist: 'Nirvana',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2739aee7acb7e4c3f8e3e3e3e3e',
    spotifyUrl: 'https://open.spotify.com/album/2guirTSEqLizK7j9i1MTTZ',
    genre: 'Rock',
    rating: 5,
    addedAt: '2026-02-10T22:00:00.000Z',
  },
];

// Demo user UID — replace with a real Firebase Auth UID after first login
const DEMO_UID = process.argv[2] || 'demo-user-001';

const demoProfile = {
  displayName: 'Demo User',
  photoURL: '',
  favoriteAlbumId: null,
};

async function seed() {
  console.log(`🌱 Seeding Firestore for user: ${DEMO_UID}...`);

  // Seed user profile
  await setDoc(doc(db, 'users', DEMO_UID), demoProfile, { merge: true });
  console.log('  ✅ Profil utilisateur créé');

  // Seed albums under users/{uid}/albums
  const col = collection(db, 'users', DEMO_UID, 'albums');
  let firstAlbumId = null;

  for (const album of albums) {
    const docRef = await addDoc(col, album);
    if (!firstAlbumId) firstAlbumId = docRef.id;
    console.log(`  ✅ ${album.name} — ${album.artist} (${docRef.id})`);
  }

  // Set first album as favorite
  if (firstAlbumId) {
    await setDoc(doc(db, 'users', DEMO_UID), { favoriteAlbumId: firstAlbumId }, { merge: true });
    console.log(`  ⭐ Album favori défini: ${firstAlbumId}`);
  }

  console.log(`\n🎉 ${albums.length} albums ajoutés pour l'utilisateur ${DEMO_UID} !`);
  console.log('\n💡 Usage: node scripts/seed.mjs [FIREBASE_AUTH_UID]');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

