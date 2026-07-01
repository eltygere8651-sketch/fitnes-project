import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({ lang: 'es', location: 'ES', generate_session_locally: true });
  const searchResults = await yt.search("Top 100 Canciones España", { type: "playlist" });
  console.log(JSON.stringify(searchResults.playlists[0].thumbnails, null, 2));
  console.log(JSON.stringify(searchResults.playlists[0].thumbnail, null, 2));
}
test();
