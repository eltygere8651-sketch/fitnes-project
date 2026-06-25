const PIPED_INSTANCES = [
  "https://pipedapi.drgns.space",
  "https://api.piped.projectsegfau.lt",
  "https://piped-api.lunar.icu",
  "https://pipedapi.ngn.tf",
  "https://pipedapi.smnz.de",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.privacydev.net"
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
