const { Innertube } = require('youtubei.js');

async function test() {
  const ytMX = await Innertube.create({ gl: 'MX', hl: 'es' });
  const resMX = await ytMX.search("Top 100", { type: 'playlist' });
  
  const ytDO = await Innertube.create({ gl: 'DO', hl: 'es' });
  const resDO = await ytDO.search("Top 100", { type: 'playlist' });
  
  console.log("MX First Playlist:", resMX.playlists?.[0]?.title?.text);
  console.log("DO First Playlist:", resDO.playlists?.[0]?.title?.text);
}
test();
