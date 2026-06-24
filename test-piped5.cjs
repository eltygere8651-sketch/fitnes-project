const PIPED_INSTANCES = [
  "https://api.piped.projectsegfau.lt",
  "https://piped-api.garudalinux.org",
  "https://pipedapi.in.projectsegfau.lt",
  "https://pipedapi.us.projectsegfau.lt",
  "https://pipedapi.sydney.projectsegfau.lt",
  "https://pipedapi.simple-web.org",
  "https://pipedapi.uxn.one",
  "https://pipedapi.yt-mirror.eu"
];

async function checkInstances() {
  for (const instance of PIPED_INSTANCES) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${instance}/trending?region=US`, { 
        method: "GET"
      });
      const endTime = Date.now();
      console.log(`${instance}: ${response.status} (${endTime - startTime}ms)`);
    } catch (e) {
      console.log(`${instance}: Error ${e.message}`);
    }
  }
}
checkInstances();
