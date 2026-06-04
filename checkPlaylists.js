import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function checkPlaylists() {
  try {
    const q = collection(db, "playlists");
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      console.log(docSnap.id, "=>", data.name, "Cover:", !!data.thumbnail_url, "Track1:", !!data.tracks?.[0]?.thumbnail, data.tracks?.[0]?.artwork_url, data.tracks?.[0]?.artwork);
      
      // Fix martina playlist if it is called martina
      if (data.name.toLowerCase().includes('martina')) {
        const cover = data.thumbnail_url || data.tracks?.[0]?.thumbnail || data.tracks?.[0]?.artwork_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop";
        if (!data.thumbnail_url || data.thumbnail_url === "") {
          console.log("Updating martina playlist thumbnail to:", cover);
          await updateDoc(docSnap.ref, {
             thumbnail_url: cover
          });
          console.log("Done updating martina");
        }
      }
    });
  } catch(e) {
    console.error(e);
  }
}
checkPlaylists();
