async function test() {
  const pRes = await fetch("https://invidious.asir.dev/api/v1/playlists/PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw");
  console.log(pRes.status);
  const data = await pRes.json();
  console.log(data.playlistThumbnail);
}
test();
