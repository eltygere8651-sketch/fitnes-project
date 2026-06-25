import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create();
  
  const search1 = await yt.search("Top 100 Canciones España", { type: 'playlist' });
  if (search1.playlists?.length) {
    console.log("Top 100 Title:", search1.playlists[0].metadata?.title?.text || search1.playlists[0].metadata?.title?.toString());
  }
  
  const search2 = await yt.search("Top Tendencias Canciones España", { type: 'playlist' });
  if (search2.playlists?.length) {
    console.log("Tendencias Title:", search2.playlists[0].metadata?.title?.text || search2.playlists[0].metadata?.title?.toString());
  }

  const search3 = await yt.search("Novedades España", { type: 'playlist' });
  if (search3.playlists?.length) {
    console.log("Novedades Title:", search3.playlists[0].metadata?.title?.text || search3.playlists[0].metadata?.title?.toString());
  }
}
test();
