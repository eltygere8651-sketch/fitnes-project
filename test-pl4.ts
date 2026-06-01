import { Innertube, UniversalCache } from 'youtubei.js';
async function test() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const results = await yt.search('play list top uk');
  console.log("ALL TYPE:", results.results?.length);
  const results2 = await yt.search('play list top uk', { type: 'playlist' });
  console.log("PLAYLIST TYPE:", results2.playlists?.length);
}
test();
