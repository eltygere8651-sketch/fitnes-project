import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create();
  const explore = await yt.music.getExplore();
  if(explore.sections) {
    explore.sections.forEach(s => {
       console.log("Section name:", s.header?.title?.text || s.title?.text || "Unknown");
    });
  }
}
test();
