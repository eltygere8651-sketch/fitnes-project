import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  try {
    const res = await yt.search('top songs españa', { type: 'playlist' });
    console.log("Keys:", Object.keys(res));
    console.log("Playlists:", res.playlists?.length);
    if(res.playlists) res.playlists.slice(0,2).forEach(p => console.log(p.title?.text || p.title, p.id));
  } catch(e) { console.error(e.message) }
}
run();
