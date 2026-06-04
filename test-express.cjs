const express = require("express");
const { Innertube } = require("youtubei.js");

const app = express();
let yt;

app.get("/test", async (req, res) => {
  if (!yt) yt = await Innertube.create();
  try {
    const playlist = await yt.getPlaylist('PLXl9q53Jut6mtBQLGn9fsm4Sf1yMtz3dp');
    let rawVideos = [];
    if (playlist.items && playlist.items.length > 0) {
      rawVideos = Array.from(playlist.items);
      console.log(`[API PL] Using playlist.items ${rawVideos.length}`);
    }
    
    console.log(`[API PL] rawVideos length: ${rawVideos.length}`);

    const tracks = rawVideos.map((v) => {
        const title = v.title?.text || v.title?.toString() || "Untitled Track";
        const id = v.id || v.video_id;
        if (id && title) return { id, title };
        return null;
    }).filter(Boolean);
    
    res.json({ length: tracks.length });
  } catch(e) { res.status(500).json({e: e.message}) }
});

app.listen(3005, () => console.log("running"));
