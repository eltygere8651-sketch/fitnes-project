const INVIDIOUS_INSTANCES = [
  "https://vid.puffyan.us",
  "https://invidious.jing.rocks",
  "https://inv.tux.pizza"
];

async function checkInstances() {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${instance}/api/v1/trending?region=US`, { 
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
