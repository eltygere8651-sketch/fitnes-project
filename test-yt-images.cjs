const { Innertube } = require('youtubei.js');
async function run() {
  const yt = await Innertube.create();
  const res = await yt.search("best gym music playlist workout", { type: 'playlist' });
  const items = res.playlists || res.contents || res.videos || res.items || [];
  let playlist = null;
  if (items.length > 0) playlist = items[0];
  else if (res.contents && res.contents.tabs) playlist = res.contents.tabs[0].content.contents[0].contents[0];

  if (playlist) {
      console.log("Images:");
      console.log(JSON.stringify(playlist.content_image, null, 2));
      console.log("Image Thumbnail:");
      if (playlist.contentImage) console.log(JSON.stringify(playlist.contentImage, null, 2));
  }
}
run();
