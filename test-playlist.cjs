const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  try {
     const pl = await yt.getPlaylist("RDCLAK5uy_m-zEtyW9EceXz8eD8X_mG78l1E7F-x5YQ");
     console.log("Title:", pl.info.title);
     console.log("Thumbnail:", pl.info.thumbnails);
  } catch (e) {
     console.log("Error:", e.message);
  }
}
test();
