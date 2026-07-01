async function test() {
  const pRes = await fetch("https://pipedapi.syncpundit.io/playlists/PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw");
  console.log(pRes.status);
  if(pRes.status === 200) {
     const data = await pRes.json();
     console.log(data.thumbnailUrl);
  } else {
     console.log(await pRes.text().then(t => t.substring(0, 100)));
  }
}
test();
