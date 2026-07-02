const http = require('http');

function fetchExplore(country) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000/api/youtube/explore?country=${country}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    });
  });
}

async function test() {
  try {
    const mx = await fetchExplore('MX');
    const es = await fetchExplore('ES');
    const doRep = await fetchExplore('DO');
    
    console.log("MX Top 100:", mx.top100?.slice(0, 3).map(x => x.title));
    console.log("ES Top 100:", es.top100?.slice(0, 3).map(x => x.title));
    console.log("DO Top 100:", doRep.top100?.slice(0, 3).map(x => x.title));
  } catch(e) { console.error(e); }
}
test();
