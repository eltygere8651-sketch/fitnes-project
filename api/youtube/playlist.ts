import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;
const playlistCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "Missing playlist id" });

  const cached = playlistCache.get(id);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.json(cached.data);
  }

  try {
    if (!yt) {
      yt = await Innertube.create({ cache: new UniversalCache(false) }); 
    }
  } catch (err) {
    return res.status(503).json({ error: "Service unavailable" });
  }

  try {
    const pl = await yt.getPlaylist(id);
    const tracks = pl.items?.map((v: any) => {
       try {
         const title = v.title?.text || v.title?.toString() || "Untitled";
         const author = v.author?.name || v.author?.toString() || "Unknown Artist";
         const duration = v.duration?.text || v.duration?.toString() || "";
         const videoId = v.id || v.video_id;
         const thumbnail = v.thumbnails?.[0]?.url || "";

         if (videoId && title && title !== 'Deleted video' && title !== 'Private video') {
           return {
             id: videoId,
             title,
             artist: author,
             duration,
             url: `https://www.youtube.com/watch?v=${videoId}`,
             thumbnail
           };
         }
       } catch (e) {
         return null;
       }
       return null;
    }).filter(Boolean) || [];
    
    if (tracks.length > 0) {
      playlistCache.set(id, { data: tracks, timestamp: Date.now() });
    }
    
    res.json(tracks);
  } catch (error) {
    console.error("YouTube playlist error:", error);
    res.status(500).json({ error: "Internal YouTube playlist error" });
  }
}
