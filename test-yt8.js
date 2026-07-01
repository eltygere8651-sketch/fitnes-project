import { Innertube } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({ lang: 'es', location: 'ES', generate_session_locally: true });
  const playlist = await yt.getPlaylist('PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw');
  console.log("info:", playlist.info);
}
test();
