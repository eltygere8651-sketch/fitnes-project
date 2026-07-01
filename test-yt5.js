import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({ lang: 'es', location: 'ES', generate_session_locally: true });
  const searchResults = await yt.search("Pop Playlists", { type: "playlist" });
  if (searchResults.results && searchResults.results.length > 0) {
    const items = searchResults.results.slice(0, 5);
    items.forEach(p => {
       console.log("Title:", p.title?.text || p.title);
       let thumbnail = "";
       if (p.content_image?.primary_thumbnail?.image?.length > 0) {
         thumbnail = p.content_image.primary_thumbnail.image[0].url;
       } else if (p.thumbnails && p.thumbnails.length > 0) {
         thumbnail = p.thumbnails[0].url;
       }
       console.log("Thumb:", thumbnail);
    });
  } else {
    console.log("No results");
  }
}
test();
