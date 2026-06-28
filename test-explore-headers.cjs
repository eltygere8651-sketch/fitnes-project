const Innertube = require("youtubei.js").Innertube;
async function test() {
  const yt = await Innertube.create();
  const res = await yt.music.getExplore();
  res.sections.forEach(s => {
    console.log(s.header?.title?.text);
  });
}
test().catch(console.error);
