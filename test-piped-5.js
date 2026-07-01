async function test() {
  const pRes = await fetch("https://piped-api.garudalinux.org/playlists/PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw");
  console.log(pRes.status);
  if(pRes.status === 200) {
     const data = await pRes.json();
     console.log(data.thumbnailUrl || data.relatedStreams[0]?.url);
  } else {
     console.log(await pRes.text().then(t => t.substring(0, 100)));
  }
}
test();
