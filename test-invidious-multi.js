async function test() {
  const instances = [
    "https://vid.puffyan.us",
    "https://inv.tux.pizza",
    "https://invidious.projectsegfau.lt",
    "https://invidious.privacyredirect.com",
    "https://inv.us.projectsegfau.lt"
  ];
  for (const inst of instances) {
     try {
         const pRes = await fetch(`${inst}/api/v1/playlists/PLKo_mI1-7i5eL0R3L01q4x7yC_8TjP1wV`, { signal: AbortSignal.timeout(4000) });
         console.log(inst, pRes.status);
         if (pRes.status === 200) {
             const data = await pRes.json();
             console.log(data.playlistThumbnail);
         }
     } catch(e) {
         console.log(inst, e.message);
     }
  }
}
test();
