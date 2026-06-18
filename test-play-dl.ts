import play from 'play-dl';
async function test() {
  try {
    const stream = await play.stream('dQw4w9WgXcQ');
    console.log("Stream URL:", stream.url);
  } catch (e) {
    console.error(e);
  }
}
test();
