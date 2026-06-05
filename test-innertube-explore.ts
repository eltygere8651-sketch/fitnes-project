import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const explore = await yt.music.getExplore();
  explore.sections.forEach((s, idx) => {
    console.log(`[Section ${idx}]`, s.header?.title?.text);
    if (s.contents && s.contents.length > 0) {
       console.log(` - Item 0:`, Object.keys(s.contents[0]));
       console.log(` - Item 0 type:`, s.contents[0].type);
       console.log(` - Item 0 sample:`, JSON.stringify(s.contents[0]).substring(0, 300));
    }
  });
}
run();
