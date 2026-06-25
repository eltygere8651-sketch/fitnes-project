const PIPED_INSTANCES = [
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.in.projectsegfau.lt",
  "https://pipedapi.lunar.icu"
];

async function checkInstances() {
  for (const instance of PIPED_INSTANCES) {
    try {
      console.log(`Checking ${instance}`);
      const s1 = await fetch(`${instance}/search?q=gym+motivation&filter=all`);
      console.log(` Search: ${s1.status}`);
      const s2 = await fetch(`${instance}/trending?region=US`);
      console.log(` Trending: ${s2.status}`);
    } catch (e) {
      console.log(`${instance}: Error ${e.message}`);
    }
  }
}
checkInstances();
