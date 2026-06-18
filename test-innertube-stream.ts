import { Innertube } from 'youtubei.js';

async function main() {
  const yt = await Innertube.create({ generate_session_locally: true });
  const id = 'dQw4w9WgXcQ';
  try {
    const stream = await yt.download(id, {
      type: 'audio',
      quality: 'bestefficiency',
      format: 'any'
    });
    console.log("Stream fetched!");
    // Wait for the stream
    for await (const chunk of stream) {
      console.log("Chunk received:", chunk.length);
      break; 
    }
  } catch (e) {
    console.error(e);
  }
}
main();
