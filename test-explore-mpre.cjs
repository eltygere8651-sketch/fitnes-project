const Innertube = require("youtubei.js").Innertube;

async function test() {
  const yt = await Innertube.create();
  const res = await yt.music.getExplore();
  // Find a section with MPREb or PL
  let found = null;
  res.sections.forEach(s => {
    if (s.contents) {
        s.contents.forEach(c => {
            let id = c.id || c.playlist_id || c.content_id || c.endpoint?.payload?.browseId || "";
            if (id.startsWith("MPRE")) {
                found = c;
            }
        });
    }
  });
  console.log(JSON.stringify(found, null, 2));
}
test().catch(console.error);
