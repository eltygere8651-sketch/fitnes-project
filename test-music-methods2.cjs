const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(yt.music)));
}
test();
