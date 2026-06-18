import { Innertube } from 'youtubei.js';

async function main() {
  const yt = await Innertube.create({ generate_session_locally: true });
  const id = 'dQw4w9WgXcQ';
  try {
    const info = await yt.getBasicInfo(id);
    const streamingData = info.streaming_data;
    console.log("Audio formats:", streamingData?.adaptive_formats.filter(f => f.has_audio && !f.has_video).map(f => f.url || (f as any).decipher(yt.session.player)));
  } catch (e) {
    console.error(e);
  }
}
main();
