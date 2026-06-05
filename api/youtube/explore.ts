export const maxDuration = 60;
import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;
let exploreCache: { data: any, timestamp: number, country: string } | null = null;
const EXPLORE_CACHE_TTL = 1000 * 60; // 1 minute for updates

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Desactivar caché de Vercel y Navegador (Solución definitiva para producción)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const country = (req.query.country as string || 'ES').toUpperCase();
  const countryMap: Record<string, string> = {
    "ES": "España", "MX": "México", "AR": "Argentina", "CO": "Colombia", "CL": "Chile", "PE": "Perú",
    "US": "Estados Unidos", "GB": "Reino Unido", "GLOBAL": "Mundial"
  };
  const countryName = countryMap[country] || "España";

  if (exploreCache && (Date.now() - exploreCache.timestamp < EXPLORE_CACHE_TTL) && exploreCache.country === country) {
    return res.json(exploreCache.data);
  }

  try {
    if (!yt) {
       yt = await Innertube.create({ cache: new UniversalCache(false) });
    }
  } catch (error) {
    console.error('Explore: YT initialize failed', error);
    return res.status(503).json({ error: "YouTube unavailable" });
  }

  const parseYTItems = (items: any[]) => {
    return items.map((p: any) => {
      try {
        const id = p.id || p.playlist_id || p.video_id;
        if (!id) return null;

        const title = p.title?.text || p.title?.toString() || 'Sin título';
        const artist = p.author?.name || p.author?.toString() || 'YouTube';
        
        let thumbnail = '';
        if (p.thumbnails && p.thumbnails.length > 0) {
          // Get the highest resolution thumbnail (usually the last one)
          thumbnail = p.thumbnails[p.thumbnails.length - 1].url;
        } else if (p.thumbnail && p.thumbnail.thumbnails && p.thumbnail.thumbnails.length > 0) {
          thumbnail = p.thumbnail.thumbnails[p.thumbnail.thumbnails.length - 1].url;
        }

        const isPlaylist = !!p.playlist_id || (p.type?.toLowerCase().includes('playlist')) || id.toString().startsWith('PL') || id.toString().startsWith('OL');

        if (!thumbnail) {
          thumbnail = isPlaylist 
            ? "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop"
            : `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
        }

        return {
          id,
          title,
          artist,
          duration: isPlaylist ? 'Playlist' : (p.duration?.text || 'N/A'),
          url: isPlaylist ? `https://www.youtube.com/playlist?list=${id}` : `https://www.youtube.com/watch?v=${id}`,
          thumbnail,
          isPlaylist,
          subType: isPlaylist ? 'playlist' : 'cancion'
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  };

  try {
    // Optimización para Vercel (Límite 10s): Un solo registro de búsqueda amplio en lugar de varios.
    // Esto es mucho más rápido y evita timeouts en el plan gratuito de Vercel.
    const searchRes = await yt.search(`top música ${countryName} 2026 exitos mix`, { type: 'video' });
    
    const allItems = parseYTItems([
      ...(searchRes.results || []),
      ...(searchRes.videos || []),
      ...(searchRes.playlists || [])
    ]);

    // Distribuimos los resultados en diferentes categorías para dar variedad visual
    const trending = allItems.slice(0, 10);
    const dailyTop = allItems.slice(10, 20); // Mapeado a Descubrimiento Diario en el UI
    const top100 = allItems.slice(20, 30);
    const trends = allItems.slice(30, 40);
    const latin = allItems.slice(40, 50);

    const finalData = {
      trending,
      dailyTop,
      top100,
      workout: [],
      focus: [],
      trends,
      latin,
      party: []
    };
    
    exploreCache = { data: finalData, timestamp: Date.now(), country };
    return res.json(finalData);

  } catch (err) {
    console.error('Explore fetch error:', err);
    return res.status(500).json({ error: "Internal error" });
  }
}