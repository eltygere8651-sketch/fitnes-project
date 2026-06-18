import { YtdlCore } from '@ybd-project/ytdl-core';
async function run() {
  const ytdl = new YtdlCore();
  const info = await ytdl.getBasicInfo('dQw4w9WgXcQ');
  console.log(info.videoDetails.title);
}
run().catch(console.error);
