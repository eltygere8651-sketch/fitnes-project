const { Innertube, UniversalCache } = require('youtubei.js');
async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const searchResult = await yt.search("best gym music playlist workout", { type: 'playlist' });
  const items = searchResult.playlists || searchResult.results || [];
  for (let i = 0; i < 3; i++) {
    const p = items[i];
    console.log("Title:", p.title?.text || p.title?.toString());
    console.log("ID:", p.id || p.playlist_id);
    let thumbs = p.thumbnails || p.thumbnail?.thumbnails;
    console.log("Thumbnails:", JSON.stringify(thumbs, null, 2));
    const contentImg = p.content_image?.primary_thumbnail?.image;
    console.log("Content Image:", JSON.stringify(contentImg, null, 2));
  }
}
run();
