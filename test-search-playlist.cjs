const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  const res = await yt.search("Top 100 Canciones España Oficial", { type: "playlist" });
  if (res.results) {
     for (let i=0; i<2; i++) {
        const p = res.results[i];
        console.log("Item", i);
        console.log("content_image", JSON.stringify(p.content_image, null, 2));
     }
  }
}
test();
