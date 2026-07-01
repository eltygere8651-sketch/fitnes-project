import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({ lang: 'es', location: 'ES', generate_session_locally: true });
  const searchResults = await yt.search("Top 100 Canciones España", { type: "playlist" });
  if (searchResults.results && searchResults.results.length > 0) {
    const p = searchResults.results[0];
    
    let thumbnail = "";
      if (p.content_image?.primary_thumbnail?.image?.length > 0) {
        const thumbList = p.content_image.primary_thumbnail.image;
        thumbnail = thumbList[0].url || thumbList[thumbList.length - 1].url || "";
      } else if (
        p.thumbnail &&
        p.thumbnail.contents &&
        p.thumbnail.contents.length > 0
      ) {
        const thumbList = p.thumbnail.contents;
        thumbnail = thumbList[0].url || thumbList[thumbList.length - 1].url || "";
      } else if (p.thumbnails && p.thumbnails.length > 0) {
        thumbnail = p.thumbnails[0].url || p.thumbnails[p.thumbnails.length - 1].url || "";
      } else if (Array.isArray(p.thumbnail) && p.thumbnail.length > 0) {
        thumbnail = p.thumbnail[0].url;
      } else if (p.thumbnail && typeof p.thumbnail === "string") {
        thumbnail = p.thumbnail;
      }

      if (thumbnail) {
        thumbnail = thumbnail.split("?")[0];
      }
      
      console.log("FINAL THUMBNAIL:", thumbnail);
  } else {
    console.log("No results");
  }
}
test();
