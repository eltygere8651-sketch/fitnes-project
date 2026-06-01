import { Innertube, UniversalCache } from 'youtubei.js';
async function test() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const results2 = await yt.search('play list uk', { type: 'playlist' });
  console.log(results2.playlists[0].type, Object.keys(results2.playlists[0]));
}
test();
