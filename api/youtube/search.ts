import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;
const searchCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Missing query" });

  const normalizedQuery = query.toLowerCase().trim();
  
  // Check eco-friendly cache
  const cached = searchCache.get(normalizedQuery);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log("Serving YouTube search from Vercel cache:", normalizedQuery);
    return res.json(cached.data);
  }

  try {
    if (!yt) {
      yt = await Innertube.create({ cache: new UniversalCache(false) }); 
    }
  } catch (err) {
    console.error("YouTube Init Error:", err);
    return res.status(503).json({ error: "Service unavailable" });
  }

  try {
    const results = await yt.search(query, { type: 'video' });
    const videos = results.videos ? results.videos.map((v: any) => {
      try {
        const title = v.title?.text || v.title?.toString() || "Untitled";
        const author = v.author?.name || v.author?.toString() || "Unknown Artist";
        const duration = v.duration?.text || v.duration?.toString() || "";
        const id = v.id || v.video_id;
        const thumbnail = v.thumbnails?.[0]?.url || "";

        if (id && title) {
          return {
            id,
            title,
            artist: author,
            duration,
            url: `https://www.youtube.com/watch?v=${id}`,
            thumbnail
          };
        }
      } catch (e) {
        return null;
      }
      return null;
    }).filter(Boolean) : [];
    
    if (videos.length > 0) {
      searchCache.set(normalizedQuery, { data: videos, timestamp: Date.now() });
    }
    
    res.json(videos);
  } catch (error) {
    console.error("YouTube search error:", error);
    res.status(500).json({ error: "Internal YouTube search error" });
  }
}
