const http = require('http');
http.get('http://localhost:3000/api/youtube/playlist?id=PLFcGX84jKOu49Uwyfy1G4WXAc1fT-piU_', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log("Returned:", data.length, "tracks");
    } catch(e) {
      console.log("Error parsing:", e.message);
    }
  });
}).on('error', e => console.error(e));
