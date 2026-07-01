async function test() {
  const pRes = await fetch("https://pipedapi.kavin.rocks/playlists/PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw");
  const pData = await pRes.json();
  console.log(pData.thumbnailUrl);
}
test();
