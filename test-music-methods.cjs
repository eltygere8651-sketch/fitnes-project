const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  console.log(Object.keys(yt.music));
}
test();
