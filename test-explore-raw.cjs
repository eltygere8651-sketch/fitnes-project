const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  const res = await yt.music.getExplore();
  if (res.sections) {
     for (let i=0; i<res.sections.length; i++) {
        const s = res.sections[i];
        console.log("Section", i, s.header?.title?.text);
        if (s.items && s.items.length > 0) {
            const p = s.items[0];
            console.log("  keys:", Object.keys(p));
            console.log("  thumbnail?:", p.thumbnails, p.thumbnail, p.content_image);
            console.log("  title:", p.title || p.metadata?.title);
        } else if (s.contents && s.contents.length > 0) {
            const p = s.contents[0];
            console.log("  keys:", Object.keys(p));
            console.log("  thumbnail?:", p.thumbnails, p.thumbnail, p.content_image);
        }
     }
  }
}
test();
