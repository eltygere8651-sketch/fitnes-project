import https from "https";

const PipedApiList = "https://raw.githubusercontent.com/TeamPiped/Piped-Instances/main/instances.json";
const InvidiousApiList = "https://api.invidious.io/instances.json";

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const piped = await fetchJSON(PipedApiList);
    const pipedActive = piped.filter(i => i.up_to_date).map(i => i.api_url);
    console.log("Piped:", pipedActive.slice(0, 5));
  } catch (e) {
    console.log("Failed piped:", e.message);
  }
  
  try {
    const inv = await fetchJSON(InvidiousApiList);
    const invActive = inv.filter(i => i[1] && i[1].type === "https" && i[1].api === true).map(i => i[1].uri);
    console.log("Invidious:", invActive.slice(0, 5));
  } catch (e) {
    console.log("Failed invidious:", e.message);
  }
}
run();
