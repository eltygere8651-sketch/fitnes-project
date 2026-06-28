const http = require('http');

http.get('http://localhost:3000/api/youtube/explore', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        const top100 = json.top100.slice(0, 3);
        const pop = json.top20Tendencias.slice(0, 3);
        console.log(JSON.stringify({top100, pop}, null, 2));
    } catch(e) {
        console.log("Parse error:", data.substring(0, 100));
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
