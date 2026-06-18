import ytdl from '@distube/ytdl-core';
ytdl.getInfo('dQw4w9WgXcQ').then(info => {
  console.log("Success:", info.videoDetails.title);
  const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
  console.log("Audio URL:", audioFormats[0].url);
}).catch(console.error);
