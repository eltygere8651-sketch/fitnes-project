export const maxDuration = 60;
import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;
let exploreCache: { data: any, timestamp: number, country: string } | null = null;
const EXPLORE_CACHE_TTL = 1000 * 60 * 60;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const country = (req.query.country as string || 'ES').toUpperCase();

  if (exploreCache && (Date.now() - exploreCache.timestamp < EXPLORE_CACHE_TTL) && exploreCache.country === country) {
    return res.json(exploreCache.data);
  }

  const createItem = (id: string, title: string, artist: string, subType: string = 'playlist', isPlaylist: boolean = true) => ({
    id, title, artist, duration: isPlaylist ? 'Playlist' : 'Canción', 
    url: isPlaylist ? `https://www.youtube.com/playlist?list=${id}` : `https://www.youtube.com/watch?v=${id}`,
    thumbnail: isPlaylist ? 'https://i.ytimg.com/vi/1zJcoPT-0VI/mqdefault.jpg' : `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    isPlaylist, subType
  });

  const staticFallback = {
    trending: [
      createItem('PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5', 'Top 50 Global Hits', 'YouTube Mix'),
      createItem('PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i', 'Top 100 Canciones Populares', 'Pop Mix'),
      createItem('PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI', 'Top Music España', 'Hits 2026'),
      createItem('PLPDbJgG2g9hJkKkE14iQZ5T_bY8mZ0Xq_', 'Reggaeton 2026', 'Latino Mix')
    ],
    dailyTop: [
      createItem('PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r', 'Perreo y Reggaeton', 'Top Diario'),
      createItem('PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf', 'Pop Hits Diarios', 'Exitos')
    ],
    top100: [
      createItem('PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i', 'Top 100 Hits 2026', 'Pop y Urbano'),
      createItem('PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf', 'Pop Music Playlist', 'Grandes Éxitos')
    ],
    workout: [
      createItem('PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5', 'Gym Motivation & Workout', 'Energy Mix', 'mix')
    ],
    focus: [
      createItem('PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE', 'Lofi Hip Hop Radio', 'Chill Beats'),
      createItem('PLj4B1G8qH_N0nU1B3xM7vU8R4G4K3H-2', 'Coding Mix Lofi', 'Relax')
    ],
    trends: [
      createItem('PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz', 'Novedades Fin de Semana', 'Últimos Lanzamientos')
    ],
    latin: [
      createItem('PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r', 'Reggaeton Mix', 'Perreo'),
      createItem('PLPDbJgG2g9hJkKkE14iQZ5T_bY8mZ0Xq_', 'Bachata y Salsa', 'Ritmos Latinos')
    ],
    party: [
      createItem('PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB', 'Party Mix 2026', 'Dance & EDM')
    ]
  };

  try {
    if (!yt) {
       yt = await Innertube.create({ cache: new UniversalCache(false) });
    }
  } catch (error) {
    console.error('Explore: YT initialize failed', error);
    exploreCache = { data: staticFallback, timestamp: Date.now(), country };
    return res.json(staticFallback);
  }

  try {
     const resultsObj = await yt.search('Top Hits Mix 2026 ' + country, { type: 'playlist' });
     const newItems: any[] = [];
     
     if (resultsObj && resultsObj.playlists) {
         resultsObj.playlists.slice(0, 15).forEach((p: any) => {
             const title = p.title?.text || p.title?.toString() || 'Mix';
             const author = p.author?.name || p.author?.toString() || 'YouTube';
             const id = p.id || p.playlist_id;
             let thumbnail = '';
             if (p.thumbnails && p.thumbnails.length > 0) thumbnail = p.thumbnails[0].url;
             if (id) {
               newItems.push({
                   id, title, artist: author, duration: 'Playlist',
                   url: `https://www.youtube.com/playlist?list=${id}`,
                   thumbnail: thumbnail || staticFallback.trending[0].thumbnail,
                   isPlaylist: true, subType: 'playlist'
               });
             }
         });
     }

     const finalData = { ...staticFallback };
     if (newItems.length > 0) {
         finalData.trending = [...newItems.slice(0, 5), ...finalData.trending];
         finalData.dailyTop = [...newItems.slice(5, 10), ...finalData.dailyTop];
         finalData.trends = [...newItems.slice(10, 15), ...finalData.trends];
     }
     
     exploreCache = { data: finalData, timestamp: Date.now(), country };
     return res.json(finalData);

  } catch (err) {
     console.error('Explore fetch error:', err);
     exploreCache = { data: staticFallback, timestamp: Date.now(), country };
     return res.json(staticFallback);
  }
}