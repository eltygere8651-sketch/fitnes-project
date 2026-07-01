const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  try {
     const pl = await yt.music.getPlaylist("RDCLAK5uy_m-zEtyW9EceXz8eD8X_mG78l1E7F-x5YQ");
     if (pl.contents && pl.contents.length > 0) {
        console.log("First track:", pl.contents[0].title, pl.contents[0].thumbnail);
     }
  } catch (e) {
     console.log("Error:", e.message);
  }
}
test();
