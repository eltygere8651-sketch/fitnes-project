const { Innertube } = require('youtubei.js');

async function test() {
  const ytMX = await Innertube.create({ gl: 'MX', hl: 'es-419' });
  const ytES = await Innertube.create({ gl: 'ES', hl: 'es-ES' });
  
  const resMX = await ytMX.music.getExplore();
  const resES = await ytES.music.getExplore();
  
  console.log("MX First Section:", resMX.sections[0]?.header?.title?.text || resMX.sections[0]?.title?.text);
  console.log("ES First Section:", resES.sections[0]?.header?.title?.text || resES.sections[0]?.title?.text);
}
test();
