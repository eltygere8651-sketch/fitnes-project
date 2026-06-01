import { Innertube, UniversalCache } from 'youtubei.js';
async function test() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const results = await yt.search('uk top 40 playlist');
  const parsedResults: any[] = [];
  
    if (results.results) {
      for (const item of results.results) {
         if (item.type === 'LockupView' && item.content_type === 'PLAYLIST') {
           try {
             const title = item.metadata?.title?.text || "Playlist";
             const author = item.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text || "YouTube";
             const id = item.content_id;
             const thumbnail = item.content_image?.primary_thumbnail?.image?.[0]?.url || "";
             
             if (id && title) {
               parsedResults.push({
                 id,
                 title: title,
                 artist: author,
                 duration: "PLAYLIST",
                 url: `https://www.youtube.com/playlist?list=${id}`,
                 thumbnail,
                 isPlaylist: true
               });
             }
           } catch(e) {}
        }
      }
    }
  console.log("Extracted playlists:", parsedResults);
}
test();
