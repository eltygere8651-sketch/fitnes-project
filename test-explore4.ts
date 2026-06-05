import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  
  const explore = await yt.music.getExplore();
  console.log(explore?.sections?.map(s => s?.header?.title?.text));
}
run();
