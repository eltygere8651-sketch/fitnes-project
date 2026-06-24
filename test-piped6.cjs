const PIPED_INSTANCES = [
  "https://piped-api.privacy.com.de",
  "https://api.piped.privacydev.net",
  "https://api.piped.minn.in",
  "https://pipedapi.cow.moe",
  "https://pipedapi.ro",
  "https://pipedapi.lunar.icu",
  "https://pipedapi.moomoo.me"
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
