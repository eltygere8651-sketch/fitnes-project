import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({ lang: 'es', location: 'ES', generate_session_locally: true });
  const searchResults = await yt.search("Top 100 Canciones España", { type: "playlist" });
  if (searchResults.results && searchResults.results.length > 0) {
    const p = searchResults.results[0];
    console.log(Object.keys(p));
    if (p.thumbnails) console.log("p.thumbnails", p.thumbnails);
    if (p.thumbnails) console.log(JSON.stringify(p.thumbnails, null, 2));
    console.log(JSON.stringify(p, null, 2));
  } else {
    console.log("No results");
  }
}
test();
