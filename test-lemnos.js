async function test() {
  const pRes = await fetch("https://yt.lemnoslife.com/playlists?part=snippet&id=PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw");
  console.log(pRes.status);
  const data = await pRes.json();
  console.log(data);
}
test();
