import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({ lang: 'es', location: 'ES', generate_session_locally: true });
  const searchResults = await yt.search("Top 100 Canciones España", { type: "playlist" });
  if (searchResults.results && searchResults.results.length > 0) {
    const items = searchResults.results.slice(0, 5);
    items.forEach(p => {
       let thumbnail = "";
       if (p.content_image?.primary_thumbnail?.image?.length > 0) {
         thumbnail = p.content_image.primary_thumbnail.image[0].url;
       } else if (p.thumbnails && p.thumbnails.length > 0) {
         thumbnail = p.thumbnails[0].url;
       }
       console.log("Original Thumb:", thumbnail);
       console.log("Stripped Thumb:", thumbnail.split("?")[0]);
    });
  }
}
test();
