import { Innertube, UniversalCache } from 'youtubei.js';

let yt: Innertube | null = null;

// Cache for explore endpoint (4 hours)
let exploreCache: { data: any, timestamp: number, country: string } | null = null;
const EXPLORE_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const country = (req.query.country as string || "ES").toUpperCase();
  const countryMap: Record<string, string> = {
    "GLOBAL": "Global",
    "US": "Estados Unidos",
    "ES": "España",
    "MX": "México",
    "AR": "Argentina",
    "CO": "Colombia",
    "CL": "Chile",
    "PE": "Perú",
    "VE": "Venezuela",
    "EC": "Ecuador",
    "GT": "Guatemala",
    "CU": "Cuba",
    "BO": "Bolivia",
    "DO": "República Dominicana",
    "HN": "Honduras",
    "PY": "Paraguay",
    "SV": "El Salvador",
    "NI": "Nicaragua",
    "CR": "Costa Rica",
    "PA": "Panamá",
    "PR": "Puerto Rico",
    "UY": "Uruguay",
    "GB": "Reino Unido",
    "DE": "Alemania",
    "FR": "Francia",
    "IT": "Italia",
    "PT": "Portugal",
    "SE": "Suecia",
    "NO": "Noruega",
    "CH": "Suiza",
    "NL": "Países Bajos",
    "BE": "Bélgica"
  };
  const countryName = countryMap[country] || "España";

  if (exploreCache && (Date.now() - exploreCache.timestamp < EXPLORE_CACHE_TTL) && exploreCache.country === country) {
    return res.json(exploreCache.data);
  }

  if (!yt) {
    try {
      yt = await Innertube.create({ cache: new UniversalCache(false) });
    } catch (e) {
      return res.status(503).json({ error: "YouTube service unavailable" });
    }
  }

  const parseItems = (rawItems: any[]) => {
    const combined: any[] = [];
    const addedIds = new Set<string>();

    const addParsedItem = (item: any) => {
      if (!item || !item.id) return;
      if (addedIds.has(item.id)) return;
      addedIds.add(item.id);
      combined.push(item);
    };

    rawItems.forEach((p: any) => {
      try {
        if (!p) return;
        const type = (p.type || p.constructor?.name || "").toLowerCase();
        
        let id = p.id?.toString() || p.playlist_id?.toString() || p.video_id?.toString() || p.content_id?.toString() || "";
        if (!id) return;
        if (addedIds.has(id)) return;

        let title = p.title?.text || p.title?.toString() || "";
        if (!title && p.metadata?.title?.text) {
          title = p.metadata.title.text;
        }
        if (!title) return;

        let author = "YouTube Curator";
        if (p.author) {
          author = p.author.name || p.author.toString() || "YouTube Creator";
        } else if (p.short_byline_text) {
          author = p.short_byline_text.toString();
        } else if (p.metadata?.metadata?.metadata_rows) {
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
          const imgs = p.content_image.primary_thumbnail.image;
          thumbnail = imgs[0].url || "";
        }

        const isPlaylistId = id.startsWith("PL") || id.startsWith("UU");
        const isYouTubeMixId = id.startsWith("RD");
        
        let videoCountStr = "";
        if (p.content_image?.primary_thumbnail?.overlays) {
          const overlays = p.content_image.primary_thumbnail.overlays || [];
          for (const overlay of overlays) {
            const badges = overlay.badges || [];
            for (const badge of badges) {
              if (badge.text) {
                videoCountStr = badge.text.toString();
                break;
              }
            }
            if (videoCountStr) break;
          }
        }

        const hasPlaylistIndicator = !!p.playlist_id || p.video_count !== undefined || p.video_count_text !== undefined || videoCountStr !== "";
        
        const isPlaylistType = type.includes("playlist") || (p.content_type || "").toUpperCase() === "PLAYLIST" || isPlaylistId || (hasPlaylistIndicator && !isYouTubeMixId);
        const isMixType = type.includes("mix") || (p.content_type || "").toUpperCase() === "MIX" || isYouTubeMixId;

        if (!thumbnail) {
          if (isPlaylistType) {
            thumbnail = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300";
          } else {
            thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
          }
        }

        if (isPlaylistType || isMixType) {
          if (!videoCountStr) {
            if (p.video_count !== undefined) {
              const rawVal = p.video_count;
              videoCountStr = typeof rawVal === 'object' ? (rawVal.text || rawVal.toString()) : rawVal.toString();
            } else if (p.video_count_text) {
              const rawValText = p.video_count_text;
              videoCountStr = typeof rawValText === 'object' ? (rawValText.text || rawValText.toString()) : rawValText.toString();
            }
          }

          if (!videoCountStr || videoCountStr === "Playlist" || videoCountStr === "0") {
            videoCountStr = isMixType ? "Mix" : "Canal";
          } else if (!isNaN(Number(videoCountStr))) {
            videoCountStr = `${videoCountStr} videos`;
          }

          let subType = "playlist";
          if (isYouTubeMixId || (!isPlaylistId && (type.includes("mix") || title.toLowerCase().includes("session") || title.toLowerCase().includes("dj set")))) {
            subType = "mix";
          }

          addParsedItem({
            id,
            title,
            artist: author,
            duration: videoCountStr,
            url: `https://www.youtube.com/playlist?list=${id}`,
            thumbnail,
            isPlaylist: true,
            subType
          });
        } else {
          let duration = "N/A";
          if (p.duration) {
            duration = p.duration.text || p.duration.toString() || "N/A";
          } else if (p.length_text) {
            duration = p.length_text.text || p.length_text.toString() || "N/A";
          }

          let subType = "cancion";
          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes("mix") || lowerTitle.includes("remix") || lowerTitle.includes("set") || lowerTitle.includes("hour") || lowerTitle.includes("dance mix") || lowerTitle.includes("phonk mix") || lowerTitle.includes("gym mix")) {
            subType = "mix";
          }

          addParsedItem({
            id,
            title,
            artist: author,
            duration,
            url: `https://www.youtube.com/watch?v=${id}`,
            thumbnail,
            isPlaylist: false,
            subType
          });
        }
      } catch (e) {
        // Skip entry
      }
    });

    return combined;
  };

  try {
    const [
      trendingRes, 
      dailyTopRes, 
      top100Res, 
      workoutRes, 
      focusRes,
      newReleasesRes,
      latinRes,
      partyRes
    ] = await Promise.allSettled([
      yt.search(`música tendencia ${countryName} 2026`, { type: 'video' }),
      yt.search(`top diario canciones ${countryName} music charts`, { type: 'video' }),
      yt.search(`top 100 canciones mas populares ${countryName}`, { type: 'playlist' }),
      yt.search("best gym music playlist workout", { type: 'playlist' }),
      yt.search("lofi chill study concentration playlist", { type: 'playlist' }),
      yt.search(`nuevos lanzamientos musica ${countryName} 2026`, { type: 'playlist' }),
      yt.search(`top exitos reggaeton urbano latino ${countryName}`, { type: 'playlist' }),
      yt.search("fiesta party mix music playlist", { type: 'playlist' })
    ]);

    const getItemsFromPayload = (res: any) => {
      const items: any[] = [];
      if (res.status === 'fulfilled' && res.value) {
        const val = res.value;
        if (val.results && Array.isArray(val.results)) {
          items.push(...val.results);
        }
        if (val.playlists && Array.isArray(val.playlists)) {
          items.push(...val.playlists);
        }
        if (val.videos && Array.isArray(val.videos)) {
          items.push(...val.videos);
        }
      }
      return items;
    };

    const trending = parseItems(getItemsFromPayload(trendingRes)).slice(0, 15);
    const dailyTop = parseItems(getItemsFromPayload(dailyTopRes)).slice(0, 15);
    const top100 = parseItems(getItemsFromPayload(top100Res)).filter(x => x.isPlaylist).slice(0, 15);
    const workout = parseItems(getItemsFromPayload(workoutRes)).filter(x => x.isPlaylist).slice(0, 15);
    const focus = parseItems(getItemsFromPayload(focusRes)).filter(x => x.isPlaylist).slice(0, 15);
    
    const newReleases = parseItems(getItemsFromPayload(newReleasesRes)).filter(x => x.isPlaylist).slice(0, 15);
    const latin = parseItems(getItemsFromPayload(latinRes)).filter(x => x.isPlaylist).slice(0, 15);
    const party = parseItems(getItemsFromPayload(partyRes)).filter(x => x.isPlaylist).slice(0, 15);

    const data = {
      trending,   
      dailyTop,   
      top100,     
      workout,    
      focus,
      trends: newReleases,
      latin,
      party
    };

    exploreCache = { data, timestamp: Date.now(), country };
    res.json(data);
  } catch (error) {
    console.error("Explore YouTube failed:", error);
    res.status(500).json({ error: "Failed to generate explore sections" });
  }
}
