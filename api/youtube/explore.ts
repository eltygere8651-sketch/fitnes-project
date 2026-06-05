export const maxDuration = 60;
import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;
let exploreCache: { data: any, timestamp: number, country: string } | null = null;
const EXPLORE_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours for production stability

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
    "US": "Estados Unidos", "GB": "Reino Unido", "DO": "República Dominicana", "GLOBAL": "Mundial"
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

  const parseInnertubeItem = (p: any): any => {
    try {
      if (!p) return null;
      let id = p.content_id || p.id?.toString() || p.endpoint?.payload?.videoId || p.endpoint?.payload?.browseId || p.playlist_id?.toString() || "";
      if (p.type === 'Playlist') id = p.id || p.playlist_id || "";
      if (!id) return null;

      let title = p.metadata?.title?.text || p.title?.text || p.title?.toString() || p.name || "";
      if (!title && typeof p.title === 'string') title = p.title;
      if (!title && p.title && typeof p.title === 'object' && p.title.text) title = p.title.text;
      if (!title) return null;

      let author = "";
      if (Array.isArray(p.artists) && p.artists.length > 0) {
        author = p.artists.map((a: any) => a.name).join(", ");
      } else if (p.author) {
        author = typeof p.author === 'string' ? p.author : (p.author.name || "");
      } else if (Array.isArray(p.subtitle?.runs)) {
        author = p.subtitle.runs.map((r: any) => r.text).join("");
      }

      let thumbnail = "";
      if (p.content_image?.primary_thumbnail?.image?.length > 0) {
         const thumbList = p.content_image.primary_thumbnail.image;
         thumbnail = thumbList[thumbList.length - 1].url;
      } else if (p.thumbnail && p.thumbnail.contents && p.thumbnail.contents.length > 0) {
        thumbnail = p.thumbnail.contents[p.thumbnail.contents.length - 1].url || p.thumbnail.contents[0].url || "";
      } else if (p.thumbnails && p.thumbnails.length > 0) {
        thumbnail = p.thumbnails[p.thumbnails.length - 1].url || p.thumbnails[0].url || "";
      } else if (p.thumbnail && typeof p.thumbnail === 'string') {
        thumbnail = p.thumbnail;
      }

      if (!thumbnail) thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

      const isPlaylist = !!p.endpoint?.payload?.browseId || id.startsWith("PL") || id.startsWith("MPRE") || p.type === 'Playlist' || id.startsWith('VL') || id.startsWith('OL');

      return {
        id: id.replace('VLPL', 'PL').replace('VL', 'PL'), 
        title,
        artist: author || "YouTube Music",
        duration: isPlaylist ? "Playlist" : (p.duration?.text || "N/A"),
        url: isPlaylist ? `https://music.youtube.com/playlist?list=${id}` : `https://music.youtube.com/watch?v=${id}`,
        thumbnail,
        isPlaylist,
        subType: isPlaylist ? "playlist" : "cancion"
      };
    } catch (e) {
      return null;
    }
  };

  try {
    const explore = await yt.music.getExplore();
    
    let trending: any[] = [];
    let dailyTop: any[] = [];
    let trends: any[] = [];

    if (explore.sections) {
      explore.sections.forEach((s: any) => {
        const headerText = (s.header?.title?.text || "").toLowerCase();
        if (!s.contents) return;
        
        const parsed = s.contents.map(parseInnertubeItem).filter(Boolean);
        
        if (headerText.includes("trending") || headerText.includes("tendencia")) {
          trending = parsed;
        } else if (headerText.includes("new music video") || headerText.includes("video")) {
          dailyTop = parsed;
        } else if (headerText.includes("new album") || headerText.includes("lanzamiento") || headerText.includes("single")) {
          trends = parsed;
        } else if (parsed.length > 0 && trends.length === 0) {
           trends = parsed.slice(0, 5);
        }
      });
    }

    // Explicitly grab the top playlist based on country
    const top100Res = await yt.search(`Top 100 Playlist ${countryName} Oficial`, { type: 'playlist' });
    const playlistsArr = top100Res.playlists || top100Res.results || [];
    const top100Data = playlistsArr.slice(0, 10).map(parseInnertubeItem).filter(Boolean);

    // EMERGENCY FALLBACK: if both trending and top100 are still empty, fetch generic hits
    if (trending.length === 0 && top100Data.length === 0) {
       const emer = await yt.search(`music hits ${countryName}`, { type: 'video' });
       trending = (emer.videos || emer.results || []).slice(0, 10).map(parseInnertubeItem).filter(Boolean);
    }

    const finalData = {
      trending,
      dailyTop,
      top100: top100Data,
      workout: [],
      focus: [],
      trends, 
      latin: [],
      party: []
    };
    
    exploreCache = { data: finalData, timestamp: Date.now(), country };
    return res.json(finalData);

  } catch (err) {
    console.error('Explore fetch error:', err);
    return res.status(500).json({ error: "Internal error" });
  }
}