import { Innertube, UniversalCache } from 'youtubei.js';
async function test() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const results = await yt.search('uk top 40 playlist');
  console.log("No type specified:");
  for (const item of results.results) {
    console.log(item.type, item.title?.text || item.metadata?.title?.text);
  }
}
test();
