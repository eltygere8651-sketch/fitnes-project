import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const data = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      dumpJson: true,
      noWarnings: true,
    });
    console.log("Audio URL:", (data as any).formats?.find((f: any) => f.vcodec === 'none' && f.acodec !== 'none').url);
  } catch(e) {
    console.error(e);
  }
}
test();
