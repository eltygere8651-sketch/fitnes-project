import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  
  try {
    const trending = await yt.getTrending();
    console.log("Trending music videos:", trending.videos?.length);
    if(trending.videos && trending.videos.length > 0) {
      console.log(trending.videos[0].title.text, trending.videos[0].author.name);
    }
  } catch (err) {
    console.error("error:", err.message);
  }
}
run();
