const { Innertube } = require('youtubei.js');
async function test() {
  const yt = await Innertube.create();
  const charts = await yt.music.getCharts('DO');
  console.log(JSON.stringify(charts.sections.map(s => s.title.text), null, 2));
}
test();
