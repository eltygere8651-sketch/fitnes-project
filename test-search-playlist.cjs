const Innertube = require("youtubei.js").Innertube;

async function test() {
  const yt = await Innertube.create();
  const res = await yt.search("Top 100 Canciones Oficial", { type: "playlist" });
  console.log(JSON.stringify(res.playlists[0], null, 2));
}
test().catch(console.error);
