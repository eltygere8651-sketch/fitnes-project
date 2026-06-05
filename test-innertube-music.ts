import { Innertube, UniversalCache } from 'youtubei.js';

async function run() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  
  try {
    const charts = await yt.music.getCharts('ES');
    console.log("Charts countries length:", charts.countries?.countries.length);
    console.log("Charts has properties:", Object.keys(charts).join(', '));
  } catch (err) {
    console.error("Music Charts error:", err.message);
  }

  try {
    const explore = await yt.music.getExplore();
    console.log("Explore has properties:", Object.keys(explore).join(', '));
  } catch (err) {
    console.error("Music Explore error:", err.message);
  }
}
run();
