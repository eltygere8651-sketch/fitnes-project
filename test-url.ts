import { Innertube } from 'youtubei.js';
async function test() {
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getInfo('dQw4w9WgXcQ');
  const format = info.chooseFormat({ type: 'audio', quality: 'best' });
  const url = format.url || (format.decipher ? await format.decipher(info.player) : '');
  console.log("URL_FOUND:", url);
}
test();
