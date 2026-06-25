const { Innertube } = require('youtubei.js');
async function run() {
  const yt = await Innertube.create();
  const res = await yt.search("best gym music playlist workout", { type: 'playlist' });
  const items = res.playlists || res.contents || res.videos || res.items || [];
  let playlist = null;
  if (items.length > 0) playlist = items[0];
  else if (res.contents && res.contents.tabs) playlist = res.contents.tabs[0].content.contents[0].contents[0]; // just trying to find it

  console.log("Raw Response format keys:", Object.keys(res));
  if (playlist) {
      console.log(JSON.stringify({
        type: playlist.type || playlist.constructor?.name,
        keys: Object.keys(playlist),
        title: playlist.title,
        id: playlist.id,
        author: playlist.author,
        thumbnails: playlist.thumbnails,
      }, null, 2));
  } else {
      console.log("no playlist found");
      if (res.results) console.log("results keys", Object.keys(res.results));
  }
}
run();
