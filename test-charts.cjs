const { Innertube } = require('youtubei.js');

async function test() {
  try {
    const yt = await Innertube.create();
    const charts = await yt.music.getCharts('MX');
    console.log("Charts sections count:", charts.sections?.length);
    if (charts.sections) {
       charts.sections.forEach(s => {
          console.log("Section:", s.header?.title?.text || s.title?.text);
          console.log("First item:", s.contents?.[0]?.title);
       });
    }
  } catch (e) {
    console.error(e);
  }
}
test();
