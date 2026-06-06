import { Innertube } from 'youtubei.js';

async function test() {
  try {
    const yt = await Innertube.create();
    const playlistId = 'PLFgquLnL59alCl_2evIMD7TE0qXGcg-zL'; // example
    const playlist = await yt.getPlaylist(playlistId);
    console.log("Got playlist info. items?", !!playlist.items, "videos?", !!playlist.videos);
  } catch (err) {
    console.error("FAILED:", err);
  }
}
test();
