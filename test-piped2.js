import https from "https";

const PipedApiList = "https://raw.githubusercontent.com/TeamPiped/Piped-Instances/main/instances.json";

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(data.slice(0, 100)); // Print start of data
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const piped = await fetchJSON(PipedApiList);
  } catch (e) {
  }
}
run();
