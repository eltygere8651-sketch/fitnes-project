const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.tokhmi.xyz", 
  "https://pipedapi.smnz.de"
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
