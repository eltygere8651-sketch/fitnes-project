import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
const firebaseConfig = require('./firebase-applet-config.json');

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function checkPlaylists() {
  try {
    const q = collection(db, "playlists");
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(doc.id, data.name, !!data.thumbnail_url, !!data.tracks?.[0]?.thumbnail, data.tracks?.[0]?.artwork_url, data.tracks?.[0]?.artwork);
    });
  } catch(e) {
    console.error(e);
  }
}
checkPlaylists();
