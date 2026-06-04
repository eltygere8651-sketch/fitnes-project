export const maxDuration = 60;
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

    exploreCache = { data, timestamp: Date.now() } as any;
    (exploreCache as any).country = country;
    const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300", isPlaylist: true }; if (data.trending.length === 0) data.trending.push(fallback); if (data.dailyTop.length === 0) data.dailyTop.push(fallback); if (data.top100.length === 0) data.top100.push(fallback); if (data.workout.length === 0) data.workout.push(fallback); if (data.focus.length === 0) data.focus.push(fallback); if (data.trends.length === 0) data.trends.push(fallback); if (data.latin.length === 0) data.latin.push(fallback); if (data.party.length === 0) data.party.push(fallback); const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300", isPlaylist: true }; if (data.trending.length === 0) data.trending.push({ ...fallback, id: "PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", title: "Top Tendencias" }); if (data.dailyTop.length === 0) data.dailyTop.push({ ...fallback, id: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", title: "Lo Más Nuevo" }); if (data.top100.length === 0) data.top100.push({ ...fallback, id: "PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", title: "Top 100 Popular" }); if (data.workout.length === 0) data.workout.push({ ...fallback, id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Gym Motivation" }); if (data.focus.length === 0) data.focus.push({ ...fallback, id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Focus & Relax" }); if (data.trends.length === 0) data.trends.push({ ...fallback, id: "PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI", title: "Novedades" }); if (data.latin.length === 0) data.latin.push({ ...fallback, id: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9CB5eXf", title: "Ritmos Latinos" }); if (data.party.length === 0) data.party.push({ ...fallback, id: "PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i", title: "Party Mix" }); res.json(data);
  } catch (error) {
    console.error("Explore YouTube failed:", error);
    const fallback = { id: "PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", title: "Top Exitos", artist: "YouTube", duration: "Playlist", url: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5", thumbnail: "https://i.ytimg.com/vi/1zJcoPT-0VI/mqdefault.jpg", isPlaylist: true }; res.json({ trending: [fallback], dailyTop: [fallback], top100: [fallback], workout: [fallback], focus: [fallback], trends: [fallback], latin: [fallback], party: [fallback] });
  }
});

// YouTube Playlist Tracks Extractor Endpoint
