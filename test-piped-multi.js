async function test() {
  const instances = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.syncpundit.io",
    "https://piped-api.garudalinux.org",
    "https://pipedapi.adminforge.de",
    "https://piped.video",
    "https://pipedapi.smnz.de"
  ];
  for (const inst of instances) {
     try {
         const pRes = await fetch(`${inst}/playlists/PLx0sYbCqOb8O_RZ69iI2N6z0J811eZkEw`, { signal: AbortSignal.timeout(3000) });
         console.log(inst, pRes.status);
         if (pRes.status === 200) {
             const data = await pRes.json();
             console.log(data.thumbnailUrl);
         }
     } catch(e) {
         console.log(inst, e.message);
     }
  }
}
test();
