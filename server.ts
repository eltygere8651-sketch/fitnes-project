import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Innertube } from 'youtubei.js';
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// Suppress excessive youtubei.js parser warnings that trigger AI Studio error bounds
const originalWarn = console.warn;
console.warn = (...args) => {
  const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ");
  if (str.includes('[YOUTUBEJS]') || str.includes('input_data') || str.includes('parsed_runs')) return;
  originalWarn.apply(console, args);
};

const originalError = console.error;
console.error = (...args) => {
  const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ");
  if (str.includes('[YOUTUBEJS]') || str.includes('input_data') || str.includes('parsed_runs')) return;
  originalError.apply(console, args);
};

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Minimal AI Setup
let aiClient: GoogleGenAI | null = null;
let yt: Innertube | null = null;

async function initYoutube() {
  try {
    yt = await Innertube.create();
    console.log("YouTube InnerTube initialized");
  } catch (err) {
    console.error("YouTube InnerTube Error:", err);
  }
}
initYoutube();

try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  console.error("AI Init Error:", error);
}

// Simple Assistant Endpoint (Minimal)
app.post("/api/ai/coach", async (req, res) => {
  res.json({ reply: "Siente el ritmo. La música está lista." });
});

// YouTube Search Cache (Eco-Friendly)
const searchCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// YouTube Search Endpoint
app.get("/api/youtube/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Missing query" });

  const normalizedQuery = query.toLowerCase().trim();
  
  // Check cache
  const cached = searchCache.get(normalizedQuery);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log("Serving YouTube search from cache (ECO):", normalizedQuery);
    return res.json(cached.data);
  }

  if (!yt) {
    try {
      yt = await Innertube.create();
    } catch (e) {
      return res.status(503).json({ error: "YouTube service unavailable" });
    }
  }

  try {
    // Perform both searches in parallel for the most complete results (General and Playlist-specific)
    const [generalResults, playlistResults] = await Promise.allSettled([
      yt.search(query),
      yt.search(query, { type: 'playlist' })
    ]);

    const rawItems: any[] = [];

    if (generalResults.status === 'fulfilled' && generalResults.value) {
      const resultsVal = generalResults.value;
      const resAny: any = resultsVal.results;
      if (resAny) {
        if (Array.isArray(resAny)) {
          rawItems.push(...resAny);
        } else if (typeof resAny.forEach === 'function') {
          resAny.forEach((x: any) => rawItems.push(x));
        } else if (typeof resAny.map === 'function') {
          resAny.map((x: any) => rawItems.push(x));
        }
      }
      if (resultsVal.playlists && Array.isArray(resultsVal.playlists)) {
        rawItems.push(...resultsVal.playlists);
      }
      if (resultsVal.videos && Array.isArray(resultsVal.videos)) {
        rawItems.push(...resultsVal.videos);
      }
    }

    if (playlistResults.status === 'fulfilled' && playlistResults.value) {
      const resultsVal = playlistResults.value;
      const resAny: any = resultsVal.results;
      if (resAny) {
        if (Array.isArray(resAny)) {
          rawItems.push(...resAny);
        } else if (typeof resAny.forEach === 'function') {
          resAny.forEach((x: any) => rawItems.push(x));
        } else if (typeof resAny.map === 'function') {
          resAny.map((x: any) => rawItems.push(x));
        }
      }
      if (resultsVal.playlists && Array.isArray(resultsVal.playlists)) {
        rawItems.push(...resultsVal.playlists);
      }
    }

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
        const type = (p.type || p.constructor?.name || "").toLowerCase();
        
        let id = p.id?.toString() || p.playlist_id?.toString() || p.video_id?.toString() || p.content_id?.toString() || "";
        if (!id) return;

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
        
        const isPlaylistType = type.includes("playlist") || (p.content_type || "").toUpperCase() === "PLAYLIST" || isPlaylistId || (!!p.playlist_id && !isYouTubeMixId);
        const isMixType = type.includes("mix") || (p.content_type || "").toUpperCase() === "MIX" || isYouTubeMixId;

        if (!thumbnail) {
          if (isPlaylistType) {
            thumbnail = "https://i.ytimg.com/vi/1zJcoPT-0VI/mqdefault.jpg";
          } else {
            thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
          }
        }

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
        
        let finalIsPlaylistType = isPlaylistType || (hasPlaylistIndicator && !isYouTubeMixId);
        let finalIsMixType = isMixType;

        if (finalIsPlaylistType || finalIsMixType) {
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
      } catch (err) {
        // Skip entry on parse error
      }
    });

    // Save to cache
    if (combined.length > 0) {
      searchCache.set(normalizedQuery, { data: combined, timestamp: Date.now() });
    }
    
    res.json(combined);
  } catch (error) {
    console.error("YouTube search error:", error);
    res.status(500).json({ error: "Internal YouTube search error" });
  }
});

// Cache for explore endpoint (4 hours)
let exploreCache: { data: any, timestamp: number } | null = null;
const EXPLORE_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

app.get("/api/youtube/explore", async (req, res) => {
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
  const countryName = countryMap[country] || "España"; // Default to España if not found

  // Cache per country
  const countryCacheKey = `explore_${country}`;
  if (exploreCache && (Date.now() - exploreCache.timestamp < EXPLORE_CACHE_TTL) && (exploreCache as any).country === country) {
    console.log(`Serving YouTube explore (${country}) from cache (ECO)`);
    return res.json(exploreCache.data);
  }

  if (!yt) {
    try {
      yt = await Innertube.create();
    } catch (e) {
      return res.status(503).json({ error: "YouTube service unavailable" });
    }
  }

  // Helper parser for innerTube items
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
        
        if (!thumbnail) {
          thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
        }

        const isPlaylistId = id.startsWith("PL") || id.startsWith("OL") || id.includes("RDCL") || id.startsWith("UU") || type.includes("playlist");
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
    // Perform parallel searches to feed initial categories based on selected country
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
    
    // Additional real official playlists
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

    
    const createFb = (id: string, title: string, imgVid: string) => ({ id, title, artist: "YouTube Mix", duration: "Playlist", url: `https://www.youtube.com/playlist?list=${id}`, thumbnail: `https://i.ytimg.com/vi/${imgVid}/mqdefault.jpg`, isPlaylist: true, subType: "playlist" });
    if (data.trending.length === 0) data.trending.push(createFb("PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", "Top Tendencias", "4Lz0_SPDoqo"));
    if (data.dailyTop.length === 0) data.dailyTop.push(createFb("PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", "Lo Más Nuevo", "yebNIHKAC4A"));
    if (data.top100.length === 0) data.top100.push(createFb("PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", "Top 100 Popular", "mTQ_b9kQ6ko"));
    if (data.workout.length === 0) data.workout.push(createFb("PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", "Gym Motivation", "IZ36b3q1elI"));
    if (data.focus.length === 0) data.focus.push(createFb("PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE", "Focus & Relax", "jGflUbPQfW8"));
    if (data.trends.length === 0) data.trends.push(createFb("PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz", "Novedades", "ru0K8uYEZWw"));
    if (data.latin.length === 0) data.latin.push(createFb("PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r", "Ritmos Latinos", "C7vfCJTQ-rw"));
    if (data.party.length === 0) data.party.push(createFb("PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB", "Party Mix", "n6N1_sxlBU8"));
    exploreCache = { data, timestamp: Date.now() } as any;
    (exploreCache as any).country = country;
    res.json(data);
  } catch (error) {
    console.error("Explore YouTube failed:", error);
    
    const createFb = (id: string, title: string, imgVid: string) => ({ id, title, artist: "YouTube Mix", duration: "Playlist", url: `https://www.youtube.com/playlist?list=${id}`, thumbnail: `https://i.ytimg.com/vi/${imgVid}/mqdefault.jpg`, isPlaylist: true, subType: "playlist" });
    res.json({
      trending: [createFb("PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", "Top Tendencias", "4Lz0_SPDoqo")],
      dailyTop: [createFb("PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", "Lo Más Nuevo", "yebNIHKAC4A")],
      top100: [createFb("PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", "Top 100 Popular", "mTQ_b9kQ6ko")],
      workout: [createFb("PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", "Gym Motivation", "IZ36b3q1elI")],
      focus: [createFb("PLOzDu-MXXLliO9fBelCGIawp_EN2kO-dE", "Focus & Relax", "jGflUbPQfW8")],
      trends: [createFb("PLxA687tYuMWi8OUus77n7Ziq1j0yL0gGz", "Novedades", "ru0K8uYEZWw")],
      latin: [createFb("PLYyq1j1v4R5R20X-bepkF5V66hBWe1a-r", "Ritmos Latinos", "C7vfCJTQ-rw")],
      party: [createFb("PL7NXvXjIf-gGqSsswXm7-N0BsiW61wJzB", "Party Mix", "n6N1_sxlBU8")]
    });
  }
});

// YouTube Playlist Tracks Extractor Endpoint
app.get("/api/youtube/playlist", async (req, res) => {
  const playlistId = req.query.id as string;
  if (!playlistId) return res.status(400).json({ error: "Missing playlist ID" });

  if (!yt) {
    try {
      yt = await Innertube.create();
    } catch (e) {
      return res.status(503).json({ error: "YouTube service unavailable" });
    }
  }

  try {
    const playlist: any = await yt.getPlaylist(playlistId);
    let rawVideos: any[] = [];
    if (playlist.items && playlist.items.length > 0) {
      console.log("[API PL] items length is", playlist.items.length);
      for (let i = 0; i < playlist.items.length; i++) {
        if (playlist.items[i]) rawVideos.push(playlist.items[i]);
      }
      console.log("[API PL] loop extracted length is", rawVideos.length);
    } else if (playlist.videos) {
      if (playlist.videos.length > 0) {
        for (let i = 0; i < playlist.videos.length; i++) {
          if (playlist.videos[i]) rawVideos.push(playlist.videos[i]);
        }
      } else if (playlist.videos.entries && playlist.videos.entries.length > 0) {
        for (let i = 0; i < playlist.videos.entries.length; i++) {
          if (playlist.videos.entries[i]) rawVideos.push(playlist.videos.entries[i]);
        }
      } else if (playlist.videos.contents && playlist.videos.contents.length > 0) {
        for (let i = 0; i < playlist.videos.contents.length; i++) {
          if (playlist.videos.contents[i]) rawVideos.push(playlist.videos.contents[i]);
        }
      }
    } else if (playlist.contents && playlist.contents.length > 0) {
      for (let i = 0; i < playlist.contents.length; i++) {
        if (playlist.contents[i]) rawVideos.push(playlist.contents[i]);
      }
    }
    
    console.log(`[API PL] rawVideos length: ${rawVideos.length}`);

    const tracks = rawVideos.map((v: any) => {
      try {
        const title = v.title?.text || v.title?.toString() || "Untitled Track";
        const artist = v.author?.name || v.author?.toString() || playlist.author?.name || "Artista de YouTube";
        const duration = v.duration?.text || v.duration?.toString() || "N/A";
        const id = v.id || v.video_id;
        
        let thumbnail = "";
        if (v.thumbnails && Array.isArray(v.thumbnails) && v.thumbnails.length > 0) {
          thumbnail = v.thumbnails[0].url || "";
        } else if (v.thumbnail && v.thumbnail.thumbnails && Array.isArray(v.thumbnail.thumbnails) && v.thumbnail.thumbnails.length > 0) {
          thumbnail = v.thumbnail.thumbnails[0].url || "";
        }
        
        if (id && title) {
          return {
            id,
            title,
            artist,
            duration,
            url: `https://www.youtube.com/watch?v=${id}`,
            thumbnail: thumbnail || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          };
        }
      } catch (err) {
        return null;
      }
      return null;
    }).filter(Boolean);

    res.json(tracks);
  } catch (err) {
    console.error("Error fetching playlist tracks:", err);
    res.status(500).json({ error: "Internal error fetching playlist" });
  }
});

// Helper function to extract tracks from SoundCloud HTML
function parseSoundCloudTracks(html: string): Array<{ id: string; title: string; artist: string; url: string }> {
  try {
    // Attempt 1: Parse application/ld+json Structured Data
    const ldJsonRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = ldJsonRegex.exec(html)) !== null) {
      try {
        const json = JSON.parse(match[1].trim());
        const processPlaylist = (obj: any) => {
          if (obj && (obj["@type"] === "MusicPlaylist" || obj["@type"] === "ItemList") && Array.isArray(obj.track || obj.itemListElement)) {
            const list = obj.track || obj.itemListElement;
            const items: any[] = [];
            for (let i = 0; i < list.length; i++) {
              const item = list[i];
              const t = item.item || item;
              if (t && (t["@type"] === "MusicRecording" || t["@type"] === "MusicVideoObject" || t.name)) {
                items.push({
                  id: `sc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
                  title: t.name || `Pista ${i + 1}`,
                  artist: t.byArtist?.name || t.author?.name || t.creator?.name || "SoundCloud Artist",
                  url: t.url || "",
                });
              }
            }
            if (items.length > 0) return items;
          }
          return null;
        };

        if (Array.isArray(json)) {
          for (const obj of json) {
            const res = processPlaylist(obj);
            if (res) return res;
          }
        } else {
          const res = processPlaylist(json);
          if (res) return res;
        }
      } catch (e) {
        console.warn("JSON-LD parse error in scraper:", e);
      }
    }
  } catch (err) {
    console.error("LD-JSON main processing error:", err);
  }

  // Attempt 2: Fallback to regex parsing of raw HTML articles (noscript/crawler targets)
  const tracks: Array<{ id: string; title: string; artist: string; url: string }> = [];
  try {
    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    const articles = html.match(articleRegex);
    if (articles && articles.length > 0) {
      articles.forEach((art, index) => {
        const hrefRegex = /href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let lm;
        const links: Array<{ href: string; text: string }> = [];
        while ((lm = hrefRegex.exec(art)) !== null) {
          links.push({
            href: lm[1],
            text: lm[2].replace(/<[^>]*>/g, "").trim(),
          });
        }
        
        if (links.length >= 2) {
          const artist = links[0].text || "SoundCloud Artist";
          const title = links[1].text || "SoundCloud Track";
          const url = links[1].href.startsWith("http") ? links[1].href : `https://soundcloud.com${links[1].href}`;
          tracks.push({
            id: `sc_reg_${Date.now()}_${index}`,
            title,
            artist,
            url,
          });
        } else if (links.length === 1) {
          const title = links[0].text || "SoundCloud Track";
          const url = links[0].href.startsWith("http") ? links[0].href : `https://soundcloud.com${links[0].href}`;
          tracks.push({
            id: `sc_reg_${Date.now()}_${index}`,
            title,
            artist: "SoundCloud Artist",
            url,
          });
        }
      });
    }
  } catch (err) {
    console.error("HTML article scraper fallback error:", err);
  }

  return tracks.filter(t => t.title && t.title !== "SoundCloud" && t.title !== "SoundCloud Go");
}

// Soundcloud and Youtube oEmbed Proxy to bypass CORS issues
app.get("/api/oembed", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const ytRes = await fetch(
        `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
      );
      if (!ytRes.ok) {
         return res.status(ytRes.status).send(await ytRes.text());
      }
      const data = await ytRes.json() as any;
      return res.json({
        title: data.title,
        author_name: data.author_name,
        thumbnail_url: data.thumbnail_url,
        provider_name: "YouTube",
        tracks: []
      });
    }

    const scRes = await fetch(
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`
    );
    if (!scRes.ok) {
       return res.status(scRes.status).send(await scRes.text());
    }
    const data = await scRes.json() as any;

    // If it's a playlist, scrape the HTML in background to enrich metadata containing actual tracks list
    if (url.includes("/sets/")) {
      try {
        console.log(`Scraping SoundCloud set URL for track names: ${url}`);
        const htmlRes = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
          }
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          const tracks = parseSoundCloudTracks(html);
          if (tracks && tracks.length > 0) {
            console.log(`Successfully scraped ${tracks.length} tracks from ${url}`);
            data.tracks = tracks;
          }
        }
      } catch (scrapeErr) {
        console.error("Failed to scrape set tracks in oEmbed proxy:", scrapeErr);
      }
    }

    return res.json(data);
  } catch (error) {
    console.error("Proxy oembed error:", error);
    return res.status(500).json({ error: "Internal Fetch Error" });
  }
});

// Trial Request Notifications & Verification Endpoint
app.post("/api/trial/request", async (req, res) => {
  const { uid, email, displayName, fingerprint } = req.body;
  
  if (!uid || !email) {
    return res.status(400).json({ error: "Faltan parámetros requeridos (uid o email)" });
  }

  // Capturar la IP real del cliente
  let ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'IP_DESCONOCIDA';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  console.log(`Solicitud de prueba recibida para ${email}. IP: ${ip}, Fingerprint: ${fingerprint}`);

  // Enviar a Telegram de forma completamente gratuita si está configurado
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const text = `🔥 *Nueva Solicitud de Acceso (7 Días Gratis)*\n\n👤 *Usuario:* ${displayName || 'Sin Nombre'}\n📧 *Email:* ${email}\n🆔 *UID:* ${uid}\n🌐 *IP:* ${ip}\n🖥️ *Huella:* \`${fingerprint || 'N/A'}\`\n\n_Puedes concederle acceso desde el panel de administrador._`;
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });
      
      if (!response.ok) {
        console.error("Error al enviar notificación a Telegram:", await response.text());
      } else {
        console.log("Notificación enviada con éxito a Telegram.");
      }
    } catch (err) {
      console.error("Error al despachar notificación a Telegram:", err);
    }
  }

  return res.json({ success: true, clientIp: ip });
});

let isFirebaseAdminInitialized = false;

function getFirestoreDb() {
  if (!isFirebaseAdminInitialized) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        admin.initializeApp({
          projectId: config.projectId
        });
        isFirebaseAdminInitialized = true;
      }
    } catch (e) {
      console.error("Error initializing Firebase Admin in backend:", e);
    }
  }
  if (isFirebaseAdminInitialized) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const dbId = config.firestoreDatabaseId;
        if (dbId) {
          return getFirestore(dbId);
        }
      }
      return getFirestore();
    } catch (e) {
      console.error("Error getting firestore instance in backend:", e);
    }
  }
  return null;
}

let cachedTelegramConfig: { botToken: string; chatId: string } | null = null;
const CACHE_FILE_PATH = path.join(process.cwd(), "telegram_cache.json");

// Helper to load cache on startup
function loadTelegramCache() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, "utf-8"));
      if (data && data.botToken && data.chatId) {
        cachedTelegramConfig = data;
        console.log("Loaded cached Telegram config from disk successfully.");
      }
    }
  } catch (err) {
    console.error("Error reading Telegram cache from disk:", err);
  }
}
loadTelegramCache();

async function getTelegramConfig() {
  // 1. Try env variables first
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    return { botToken, chatId };
  }

  // 2. Try the warmed-up cache memory/file
  if (cachedTelegramConfig && cachedTelegramConfig.botToken && cachedTelegramConfig.chatId) {
    return cachedTelegramConfig;
  }

  // 3. Fallback to reading file directly
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, "utf-8"));
      if (data && data.botToken && data.chatId) {
        cachedTelegramConfig = data;
        return data;
      }
    }
  } catch (e) {
    // ignore
  }

  // 4. Try Firestore system_settings/telegram (and suppress permission errors cleanly so they don't block the response flow)
  try {
    const db = getFirestoreDb();
    if (db) {
      const doc = await db.collection("system_settings").doc("telegram").get();
      if (doc.exists) {
        const data = doc.data();
        if (data?.botToken && data?.chatId) {
          const configObj = { botToken: data.botToken, chatId: data.chatId };
          // Cache it locally too
          cachedTelegramConfig = configObj;
          try {
            fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(configObj, null, 2), "utf-8");
          } catch (writeErr) {
            console.error("Failed to write to file cache during lazy fetch:", writeErr);
          }
          return configObj;
        }
      }
    }
  } catch (err: any) {
    console.warn("Notice: Firestore Admin SDK lookup failed (likely permission/IAM issue). Using fallback settings:", err?.message || err);
  }

  return null;
}

// Endpoint to Register/Warm-up Telegram credentials from secure Admin UI
app.post("/api/support/register-telegram", async (req, res) => {
  const { botToken, chatId, adminEmail } = req.body;
  
  // Enforce security check: must be from the admin email
  if (adminEmail !== "eltygere8651@gmail.com") {
    return res.status(403).json({ error: "No autorizado. Solo el administrador maestro puede registrar credenciales." });
  }

  if (!botToken || !chatId) {
    return res.status(400).json({ error: "Faltan parámetros de Telegram botToken o chatId." });
  }

  try {
    cachedTelegramConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim()
    };

    // Save to disk cache to survive server restarts
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cachedTelegramConfig, null, 2), "utf-8");
    console.log("Cached Telegram credentials registered and saved to disk.");
    return res.json({ success: true, message: "Configuración de Telegram guardada y sincronizada correctamente en el servidor." });
  } catch (err: any) {
    console.error("Error saving Telegram cache:", err);
    return res.status(500).json({ error: "Error al guardar el caché de Telegram en el servidor" });
  }
});

// Telegram Support Message Endpoint
app.post("/api/support/telegram", async (req, res) => {
  const { userEmail, userName, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "El mensaje no puede estar vacío" });
  }

  try {
    const config = await getTelegramConfig();
    if (!config || !config.botToken || !config.chatId) {
      return res.status(503).json({ error: "El soporte por Telegram no está configurado en este momento" });
    }

    const title = `🚨 *Nuevo Mensaje de Soporte* 🚨`;
    const userLine = `👤 *Usuario:* ${userName || 'Anónimo'} (${userEmail || 'Sin email'})`;
    const messageLine = `💬 *Mensaje:*\n_${message.trim()}_`;
    const text = `${title}\n\n${userLine}\n\n${messageLine}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });

    if (!tgRes.ok) {
      const errorText = await tgRes.text();
      console.error("Error from Telegram support message API:", errorText);
      return res.status(502).json({ error: "No se pudo entregar el mensaje al bot de Telegram" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Telegram support API error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Output raw audio stream removed due to bot blocks
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
