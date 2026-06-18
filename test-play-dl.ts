import play from 'play-dl';
async function test() {
  try {
    const stream = await play.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log("Stream object keys:", Object.keys(stream));
    console.log("Stream URL:", stream.url);
  } catch (e) {
    console.error(e);
  }
}
test();
