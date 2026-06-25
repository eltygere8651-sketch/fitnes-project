const { Innertube } = require("youtubei.js");
(async () => {
    const yt = await Innertube.create();
    const playlistId = 'PLXl9q53Jut6mtBQLGn9fsm4Sf1yMtz3dp';
    const playlist = await yt.getPlaylist(playlistId);
    let rawVideos = [];
    if (playlist.items && Array.isArray(playlist.items)) {
      rawVideos = playlist.items;
      console.log("Using playlist.items");
    } else if (playlist.videos) {
      if (Array.isArray(playlist.videos)) {
        rawVideos = playlist.videos;
        console.log("Using playlist.videos");
      }
    }
    
    console.log("First item:", rawVideos[0]);

    const tracks = rawVideos.map((v) => {
        const title = v.title?.text || v.title?.toString() || "Untitled Track";
        const artist = v.author?.name || v.author?.toString() || "Artista de YouTube";
        const duration = v.duration?.text || v.duration?.toString() || "N/A";
        const id = v.id || v.video_id;
        if (id && title) return { id, title };
        return null;
    }).filter(Boolean);
    console.log("Found tracks:", tracks.length);
})();
