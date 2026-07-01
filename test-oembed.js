async function test() {
  const url = "https://www.youtube.com/playlist?list=PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw";
  const pRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
  console.log(pRes.status);
  if (pRes.status === 200) {
      console.log(await pRes.json());
  } else {
      console.log(await pRes.text());
  }
}
test();
