async function test() {
  const pRes = await fetch("https://pipedapi.kavin.rocks/playlists/PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw");
  console.log(pRes.status);
  const text = await pRes.text();
  console.log(text.substring(0, 200));
}
test();
