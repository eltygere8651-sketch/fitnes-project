const { Innertube } = require('youtubei.js');

async function test() {
  const ytMX = await Innertube.create({ gl: 'MX', hl: 'es-419' });
  const ytES = await Innertube.create({ gl: 'ES', hl: 'es-ES' });
  
  const resMX = await ytMX.search("Top 100", { type: 'playlist' });
  const resES = await ytES.search("Top 100", { type: 'playlist' });
  
  console.log("MX Top 100:", (resMX.playlists || resMX.results)[0]?.title?.text);
  console.log("ES Top 100:", (resES.playlists || resES.results)[0]?.title?.text);
}
test();
