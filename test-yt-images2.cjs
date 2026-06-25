const { Innertube } = require('youtubei.js');
async function run() {
  const yt = await Innertube.create();
  const res = await yt.search("top 100 canciones mas populares Global", { type: 'playlist' });
  const items = res.playlists || res.contents || res.videos || res.items || [];
  let playlist = null;
  if (items.length > 0) playlist = items[0];
  else if (res.contents && res.contents.tabs) playlist = res.contents.tabs[0].content.contents[0].contents[0];

  if (playlist) {
      console.log("Images for Top 100:");
      console.log(JSON.stringify(playlist.content_image || playlist.thumbnail || playlist.thumbnails, null, 2));
  }
}
run();
