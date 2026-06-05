const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const startLabel = 'app.get("/api/youtube/explore", async (req, res) => {';
const nextEndpoint = 'app.get("/api/youtube/playlist"';

const startIndex = serverCode.indexOf(startLabel);
const endIndex = serverCode.indexOf(nextEndpoint);

if (startIndex > -1 && endIndex > -1) {
  const replacement = `app.get("/api/youtube/explore", async (req, res) => {
  const country = (req.query.country || "ES").toUpperCase();
  if (exploreCache && (Date.now() - exploreCache.timestamp < 1000 * 60 * 60 * 4) && (exploreCache as any).country === country) {
    return res.json(exploreCache.data);
  }

  if (!yt) {
    try {
      yt = await Innertube.create({ cache: new UniversalCache(false) });
    } catch (e) {
      return res.status(503).json({ error: "Unavailable" });
    }
  }

  const parseItems = (rawItems: any[]) => {
    const combined: any[] = [];
    const addedIds = new Set<string>();

    rawItems.forEach((p: any) => {
      try {
        if (!p) return;
        const type = (p.type || p.constructor?.name || "").toLowerCase();
        let id = p.id?.toString() || p.playlist_id?.toString() || p.video_id?.toString() || p.content_id?.toString() || "";
        if (!id || addedIds.has(id)) return;

        let title = p.title?.text || p.title?.toString() || "";
        if (!title && p.metadata?.title?.text) title = p.metadata.title.text;
        if (!title) return;

        let author = "YouTube";
        if (p.author) author = p.author.name || p.author.toString() || "YouTube";
        else if (p.short_byline_text) author = p.short_byline_text.toString();
        else if (p.metadata?.metadata?.metadata_rows) {
          const rows = p.metadata.metadata.metadata_rows || [];
          for (const row of rows) {
            const part = row.metadata_parts?.[0];
            if (part?.text?.text) {
              author = part.text.text;
              break;
            }
          }
        }

        let thumbnail = "";
        if (p.thumbnails && Array.isArray(p.thumbnails) && p.thumbnails.length > 0) {
          thumbnail = p.thumbnails[0].url || "";
        } else if (p.thumbnail && p.thumbnail.thumbnails && Array.isArray(p.thumbnail.thumbnails) && p.thumbnail.thumbnails.length > 0) {
          thumbnail = p.thumbnail.thumbnails[0].url || "";
        } else if (p.content_image?.primary_thumbnail?.image && Array.isArray(p.content_image.primary_thumbnail.image) && p.content_image.primary_thumbnail.image.length > 0) {
          thumbnail = p.content_image.primary_thumbnail.image[0].url || "";
        }

        const isPlaylistId = id.startsWith("PL") || id.startsWith("UU") || id.startsWith("RD");
        const isPlaylistType = type.includes("playlist") || (p.content_type || "").toUpperCase() === "PLAYLIST" || isPlaylistId;

        if (isPlaylistType) {
          addedIds.add(id);
          combined.push({
            id,
            title,
            artist: author,
            duration: "Playlist",
            url: \`https://www.youtube.com/playlist?list=\${id}\`,
            thumbnail: thumbnail || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300",
            isPlaylist: true,
            subType: "playlist"
          });
        }
      } catch (e) {}
    });
    return combined;
  };

  try {
     const [
      trendingRes, 
      dailyTopRes, 
      workoutRes, 
      latinRes,
      partyRes
    ] = await Promise.allSettled([
      yt.search(\`música tendencia \${country} 2026\`, { type: 'playlist' }),
      yt.search(\`top diario canciones \${country} music charts\`, { type: 'playlist' }),
      yt.search("best gym music playlist workout", { type: 'playlist' }),
      yt.search(\`top exitos reggaeton urbano latino \${country}\`, { type: 'playlist' }),
      yt.search("fiesta party mix music playlist", { type: 'playlist' })
    ]);

    const getItems = (res: any) => {
      const items: any[] = [];
      if (res.status === 'fulfilled' && res.value) {
        const val = res.value;
        if (val.results && Array.isArray(val.results)) items.push(...val.results);
        if (val.playlists && Array.isArray(val.playlists)) items.push(...val.playlists);
        if (val.videos && Array.isArray(val.videos)) items.push(...val.videos);
      }
      return items;
    };

    const trending = parseItems(getItems(trendingRes)).slice(0, 15);
    const dailyTop = parseItems(getItems(dailyTopRes)).slice(0, 15);
    const top100 = [...trending].reverse(); 
    const workout = parseItems(getItems(workoutRes)).slice(0, 15);
    const focus = [...workout].reverse(); 
    const latin = parseItems(getItems(latinRes)).slice(0, 15);
    const party = parseItems(getItems(partyRes)).slice(0, 15);
    const trends = [...latin].reverse();

    const data = { trending, dailyTop, top100, workout, focus, trends, latin, party };
    
    const fallbackItem = { 
      id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", 
      title: "Top Exitos", 
      artist: "YouTube Mix", 
      duration: "Playlist", 
      url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", 
      thumbnail: "https://i.ytimg.com/vi/1zJcoPT-0VI/mqdefault.jpg",
      isPlaylist: true, subType: "playlist"
    };

    if (data.trending.length === 0) data.trending.push({...fallbackItem, title: "Top Tendencias"});
    if (data.dailyTop.length === 0) data.dailyTop.push({...fallbackItem, title: "Lo Más Nuevo"});
    if (data.top100.length === 0) data.top100.push({...fallbackItem, title: "Top 100 Popular"});
    if (data.workout.length === 0) data.workout.push({...fallbackItem, title: "Gym Motivation"});
    if (data.focus.length === 0) data.focus.push({...fallbackItem, title: "Focus & Relax"});
    if (data.trends.length === 0) data.trends.push({...fallbackItem, title: "Lanzamientos"});
    if (data.latin.length === 0) data.latin.push({...fallbackItem, title: "Ritmos Latinos"});
    if (data.party.length === 0) data.party.push({...fallbackItem, title: "Fiesta Mix"});

    exploreCache = { data, timestamp: Date.now(), country } as any;
    return res.json(data);

  } catch (err) {
     return res.status(500).json({ error: "Failed" });
  }
});\n\n`;

  serverCode = serverCode.substring(0, startIndex) + replacement + serverCode.substring(endIndex);
  fs.writeFileSync('server.ts', serverCode);
  console.log('Replaced exploring logic in server.ts');
} else {
  console.log('Could not find start or end index in server.ts');
}
